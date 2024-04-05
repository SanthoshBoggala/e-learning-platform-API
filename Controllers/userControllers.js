require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('../db');
const { sendEmailConfirmation } = require('../Services/emailServices');

const getAllUsers = async (req, res) => {
    let client;
    try {
        client = await pool.connect(); 
        const result = await client.query('SELECT * FROM users');
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
    const { buffer, mimetype } = req.file;
    let client;
    try {
        client = await pool.connect();

        console.log(buffer, mimetype);

        let result = await client.query('SELECT * FROM users WHERE username = $1 ', [username]);
        if(result.rows[0]){
            res.status(400).json( { msg: "username already exists" });
            return;
        }

        result = await client.query('SELECT * FROM users WHERE email = $1 ', [email]);
        if(result.rows[0]){
            res.status(400).json( { msg: "email already exists" });
            return;
        }

        const { data, error } = await sendEmailConfirmation(name, email);

        if (error) {
            console.log(error);
            return res.status(500).json({ msg: 'Error sending verification email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // result = await client.query('INSERT INTO users (username, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *', [username, name, email, hashedPassword]);
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
    const { name, email } = req.body;
    let client;
    try {
        client = await pool.connect();
        if (email) {
            let result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
            if (result.rows[0]) {
                return res.status(400).json({ msg: "email already exists" });
            }
        }

        let qry = 'SELECT * FROM users WHERE username = $1';
        let data = [username];
        if(email && name){
            qry = 'UPDATE users SET name = $1, email = $2 WHERE username = $3 RETURNING *';
            data = [name, email, username];
        }
        else if(email){
            qry = 'UPDATE users SET email = $1 WHERE username = $2 RETURNING *';
            data = [email, username];
        }
        else if(name){
            qry = 'UPDATE users SET name = $1 WHERE username = $2 RETURNING *';
            data = [name, username]; 
        }

        let result = await client.query(qry , data);
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
    const { id } = req.params;
    const { password } = req.body;

    try {
        if (!password) {
            return res.status(400).json("New password is required");
        }

        const client = await pool.connect();

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await client.query('UPDATE users SET password = $1 WHERE id = $2 RETURNING *', [hashedPassword, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
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
