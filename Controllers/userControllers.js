require('dotenv').config();

const bcrypt = require('bcrypt');
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

        const result = await client.query('SELECT * FROM users LIMIT $1 OFFSET $2', [limit, offset]);
        res.json(result.rows);

    } catch (err) {
        console.error('Error fetching Users:', err);
        res.status(500).json({ msg: 'Internal server error' });
    } finally {
        client.release(); 
    }
};

const getUserById = async (req, res) => {
    const username = req.params.id;
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user by username:', err);
        res.status(500).json({ msg: 'Internal server error' });
    } finally {
        client.release();
    }
};

const createUser = async (req, res) => {
    const {username, name, email, password } = req.body;
    const { buffer, mimetype } = req.file || { buffer : [], mimetype: "" };

    if(!name || !email || !password){
        return res.status(400).json("All fields must be provided");
    }

    let client;
    try {
        client = await pool.connect();

        let result = await client.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        if(result.rows[0]){
            res.status(400).json( { msg: "username/email already exists" });
            return;
        }

        const { data, error } = await sendEmailConfirmation(name, email);

        if (error) {
            console.log(error);
            return res.status(500).json({ msg: 'Error sending verification email' });
        }

        const hashedPassword = await bcrypt.hash(password, Number(process.env.HASHSALTS));

        result = await client.query('INSERT INTO users (username, name, email, password, image, img_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [username, name, email, hashedPassword, buffer, mimetype]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(400).json({ msg: 'Bad request' });
    } finally {
        client.release();
    }
};

const updateUserById = async (req, res) => {
    const username = req.params.id;
    let { email } = req.body;

    let client;
    try {
        client = await pool.connect();
        if (email) {
            let result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
            if (result.rows[0]) {
                return res.status(400).json({ msg: "email already exists" });
            }
        }

        const user = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        if(user.rows.length == 0){
            return res.status(404).json({ msg: 'User not found' });
        }
        const userInfo = user.rows[0];
        let { name = userInfo.name ,
              password,
        } = req.body;
        let { buffer , mimetype } = req.file || { buffer : [], mimetype: "" };

        if(!email){
            email = userInfo.email;
        }
        if(password){
            password = await bcrypt.hash(password, Number(process.env.HASHSALTS));
        } else {
            password = userInfo.password;
        }

        let qry = 'UPDATE users SET name = $1, email = $2, password = $3 WHERE username = $4 RETURNING *'
        let fields = [name, email, password, username];
        if(buffer.length !== 0 && mimetype){
            qry = 'UPDATE users SET name = $1, email = $2, password = $3, image = $4, image_type = $5 WHERE username = $6 RETURNING *';
            fields = [name, email, password, buffer, mimetype, username];
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
    const username = req.params.id;
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('DELETE FROM users WHERE username = $1 RETURNING *', [username]);
        if (result.rows.length === 0) {
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
    const username = req.params.id;
    const { password } = req.body;

    try {
        if (!password) {
            return res.status(400).json("New password is required");
        }

        const client = await pool.connect();

        const hashedPassword = await bcrypt.hash(password, process.env.HASHSALTS);

        const result = await client.query('UPDATE users SET password = $1 WHERE username = $2 RETURNING *', [hashedPassword, username]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const { data, error } = await sendPassResetEmail(result.rows[0].name, email);

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
    updateUserById,
    deleteUserById,
    passwordReset
};
