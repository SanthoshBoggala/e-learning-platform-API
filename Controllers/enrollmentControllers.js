const pool = require('../db');

const enroll = async (req, res) => {
    const { username, course_id } = req.body;

    if(!username || !course_id){
        return res.status(400).json("provide username and course id");
    }

    let client;
    try {
        client = await pool.connect();
        const checkResult = await client.query('SELECT * FROM enrollment WHERE username = $1 AND course_id = $2', [username, course_id]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: 'User is already enrolled in this course' });
        }

        const result = await client.query('INSERT INTO enrollment (username, course_id) VALUES ($1, $2) RETURNING *', [username, course_id]);

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

const viewAllEnrolledCourses = async (req, res) => {
    const { username, page = 1, limit = 10, search } = req.query;

    if (!username) {
        return res.status(400).json("Provide username");
    }

    const offset = (page - 1) * limit;

    let client;
    try {
        client = await pool.connect();

        let query = `
            SELECT * 
            FROM enrollment 
            WHERE username = $1
        `;

        let values = [username];

        if (search) {
            query += ` AND course_id IN (SELECT id FROM courses WHERE title ILIKE $2 OR category ILIKE $2)`;
            values.push(`%${search}%`);
        }

        query += ` ORDER BY enrollment_date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

        values.push(limit, offset);

        const result = await client.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

const viewAllEnrolledStudents = async (req, res) => {
    const { course_id, username, page = 1, limit = 10, search } = req.query;

    const offset = (page - 1) * limit;

    let client;
    try {
        client = await pool.connect();

        let query = `
            SELECT * 
            FROM enrollment 
            WHERE 1=1
        `;

        let values = [];

        if (course_id) {
            query += ` AND course_id = $1`;
            values.push(course_id);
        }

        if (username) {
            query += ` AND username = $${values.length + 1}`;
            values.push(username);
        }

        if (search) {
            query += ` AND username IN (SELECT username FROM users WHERE username ILIKE $${values.length + 1})`;
            values.push(`%${search}%`);
        }

        query += ` ORDER BY enrollment_date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

        values.push(limit, offset);

        const result = await client.query(query, values);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (client) {
            client.release();
        }
    }
};



module.exports = {
    enroll,
    viewAllEnrolledCourses,
    viewAllEnrolledStudents
};
