require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { sendEmailConfirmation,
    sendPassResetEmail } = require('../Services/emailServices');

const getAllUsers = async (req, res) => {
    let client;
    try {
        client = await pool.connect(); 

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const users = await client.query('SELECT * FROM users LIMIT $1 OFFSET $2', [limit, offset]);
        res.json({ users: users.rows });

    } catch (err) {
        console.error('Error fetching Users:', err);
        res.status(500).json({ msg: 'Internal server error' });
    } finally {
        client.release(); 
    }
};

const getUserById = async (req, res) => {
    const {username} = req.user;
    let client;
    try {
        client = await pool.connect();
        const user = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ user: user.rows[0] });
    } catch (err) {
        console.error('Error fetching user by username:', err);
        res.status(500).json({ msg: 'Internal server error' });
    } finally {
        client.release();
    }
};

const createUser = async (req, res) => {
    const { username, name, email, password, type = 'student' } = req.body;
    const { buffer, mimetype } = req.file || { buffer : [], mimetype: "" };

    if(!['student', 'admin'].includes(type)){
        return res.status(400).json({msg: "user type must be student/admin"});
    }
    if(!name || !email || !password){
        return res.status(400).json({msg: "All fields must be provided"});
    }

    let client;
    try {
        client = await pool.connect();

        const userExists = await client.query('SELECT * FROM users WHERE username = $1 OR (email = $2 AND type = $3)', [username, email, type]);
        if(userExists.rows[0]){
            return res.status(400).json({ msg: "username/email already exists" });
        }

        const { data, error } = await sendEmailConfirmation(name, email);

        if (error) {
            console.log(error);
            return res.status(500).json({ msg: 'Error sending verification email' });
        }

        const hashedPassword = await bcrypt.hash(password, Number(process.env.HASHSALTS));

        const newUser = await client.query('INSERT INTO users (username, name, email, password, image, img_type, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [username, name, email, hashedPassword, buffer, mimetype, type]);
        res.status(201).json({ newUser: newUser.rows[0] });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(400).json({ msg: 'Bad request' });
    } finally {
        client.release();
    }
};

const loginUser = async (req, res) => {
    const { email, password, type } = req.body;

    if(!email || !password  || !type){
        return res.status(400).json({ msg: "provide credentials"});
    }
    let client;
    try {
        client = await pool.connect();

        const user = await client.query('SELECT * FROM users WHERE email = $1 AND type = $2', [email, type]);
        if(user.rows.length == 0){
            return res.status(401).json({msg: "invalid credentials"});
        }

        if(!await bcrypt.compare(password, user.rows[0].password)){
            return res.status(400).json({msg: "password incorrect"});
        }

        const token = await jwt.sign(
                {
                    username: user.rows[0].username,
                    email: user.rows[0].email,
                    type: user.rows[0].type
                },
                process.env.JWTSECRETKEY, 
                {
                    expiresIn: '2h'
                }
            );
        res.json({token});
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(400).json({ msg: 'Bad request' });
    } finally {
        client.release();
    }
}

const updateUserById = async (req, res) => {
    const { username, type } = req.user;

    if(!type){
        return res.status(400).json({msg : "provide user type"});
    }

    let client;
    try {
        client = await pool.connect();

        const user = await client.query('SELECT * FROM users WHERE username = $1 AND type = $2', [username, type]);
        if(user.rows.length == 0){
            return res.status(404).json({ msg: 'User not found' });
        }
        const userInfo = user.rows[0];
        let { name = userInfo.name ,
              password,
              email
        } = req.body;

        if (email) {
            let user = await client.query('SELECT * FROM users WHERE email = $1 AND type = $2', [email, type]);
            if (user.rows[0]) {
                return res.status(400).json({ msg: "user already exists with this email" });
            }
        }

        let { buffer , mimetype } = req.file || { buffer : [], mimetype: "" };

        if(!email){
            email = userInfo.email;
        }
        if(password){
            password = await bcrypt.hash(password, Number(process.env.HASHSALTS));
        } else {
            password = userInfo.password;
        }

        let qry = 'UPDATE users SET name = $1, email = $2, password = $3 WHERE username = $4 AND type = $5 RETURNING *'
        let fields = [name, email, password, username, type];
        if(buffer.length !== 0 && mimetype){
            qry = 'UPDATE users SET name = $1, email = $2, password = $3, image = $4, image_type = $5 WHERE username = $6 AND type = $7 RETURNING *';
            fields = [name, email, password, buffer, mimetype, username, type];
        }
        const result = await client.query(qry, fields);
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(400).json({ msg: 'Bad request' });
    } finally {
        client.release(); 
    }
};

const deleteUserById = async (req, res) => {
    const { email, type } = req.user;

    let client;
    try {
        client = await pool.connect();
        const deletedUser = await client.query('DELETE FROM users WHERE email = $1 AND type = $2 RETURNING *', [email, type]);
        if (deletedUser.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ msg: 'Internal server error' });
    } finally {
        client.release(); 
    }
};

const passwordReset = async (req, res) => {
    const {username, type} = req.user;
    const { password } = req.body;

    let client;
    try {
        if (!password) {
            return res.status(400).json({msg: "provide all fields"});
        }

        client = await pool.connect();

        const hashedPassword = await bcrypt.hash(password, Number(process.env.HASHSALTS));

        const user = await client.query('UPDATE users SET password = $1 WHERE username = $2 AND type = $3 RETURNING *', [hashedPassword, username, type]);

        if (user.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const { data, error } = await sendPassResetEmail(user.rows[0].name , user.rows[0].email);

        if (error) {
            console.log(error);
            return res.status(500).json({ msg: 'Error sending email' });
        }

        res.json({ msg: 'Password reset successfully' });
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ msg: 'Internal server error' });
    } finally{
        if(client){
            client.release();
        }
    }
};


module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    loginUser,
    updateUserById,
    deleteUserById,
    passwordReset
};
