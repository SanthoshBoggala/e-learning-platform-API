const pool = require('../db');

const getAllUsers = async (req, res) => {
    let client;
    try {
        client = await pool.connect(); // Connect to the database and get the client object
        console.log('before')
        const result = await client.query('SELECT * FROM users');
        console.log('after')
        res.json(result.rows);

    } catch (err) {
        console.error('Error fetching Users:', err);
        res.status(500).json({ msg: 'Internal server error' });
    } finally {
        client.release(); // Release the client back to the pool
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
        client.release(); // Release the client back to the pool
    }
};

const createUser = async (req, res) => {
    const {username, name, email } = req.body;
    let client;
    try {
        client = await pool.connect();

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

        result = await client.query('INSERT INTO users (username, name, email) VALUES ($1, $2, $3) RETURNING *', [username, name, email]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(400).json({ msg: 'Bad request' });
    } finally {
        client.release(); // Release the client back to the pool
    }
};

const updateUserById = async (req, res) => {
    const email = req.params.id;
    const { name, username } = req.body;
    let client;
    try {
        client = await pool.connect();

        if(username){
            let result = await client.query('SELECT * FROM users WHERE username = $1 ', [username]);
            if(result.rows[0]){
                res.status(400).json( { msg: "username already exists" });
                return;
            }
        }

        result = await client.query('UPDATE users SET name = $1, username = $2 WHERE email = $3 RETURNING *', [name, username, email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(400).json({ msg: 'Bad request' });
    } finally {
        client.release(); // Release the client back to the pool
    }
};

const deleteUserById = async (req, res) => {
    const email = req.params.id;
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('DELETE FROM users WHERE email = $1 RETURNING *', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ msg: 'Internal server error' });
    } finally {
        client.release(); // Release the client back to the pool
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUserById,
    deleteUserById
};
