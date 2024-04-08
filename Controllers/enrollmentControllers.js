require('dotenv').config();

const pool = require('../db');
const { sendCourseEnrollEmail } = require('../Services/emailServices');

const enroll = async (req, res) => {
    const { username } = req.user;
    const { course_id } = req.body;

    if (!username || !course_id) {
        return res.status(400).json("provide username and course id");
    }

    let client;
    try {
        client = await pool.connect();
        const existsCourse = await client.query('SELECT * FROM enrollment WHERE username = $1 AND course_id = $2', [username, course_id]);

        if (existsCourse.rows.length > 0) {
            return res.status(400).json({ error: 'User is already enrolled in this course' });
        }

        const enrolledCourse = await client.query('INSERT INTO enrollment (username, course_id) VALUES ($1, $2) RETURNING *', [username, course_id]);

        if (enrolledCourse.rows.length !== 0) {
            let course = await client.query('SELECT * FROM courses WHERE id = $1', [course_id]);
            let user = await client.query('SELECT * FROM users WHERE username = $1', [username])

            const { data, error } = await sendCourseEnrollEmail(user.rows[0], course.rows[0]);

            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json("Error in sending email");
            }
        }

        res.status(200).json({ enrolledCourse: enrolledCourse.rows[0] });
    } catch (error) {
        console.error("Internal server error:", error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

const viewMyEnrolledCourses = async (req, res) => {
    const { username } = req.user;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if(!username){
        return res.status(400).json("provide username");
    }

    let client;
    try {
        client = await pool.connect();

        const allMyCourses = await client.query('SELECT e.*, c.* FROM enrollment e LEFT JOIN courses c ON e.course_id = c.id WHERE e.username = $1 ORDER BY  e.enrollment_date DESC LIMIT $2 OFFSET $3', [username, limit, offset]);

        res.json({ allMyCourses: allMyCourses.rows });
    } catch (error) {
        console.error("Internal server error:", error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

const viewAllEnrolledStudents = async (req, res) => {
    const { course_id, page = 1, limit = 10, search } = req.query;

    const offset = (page - 1) * limit;

    let client;
    try {
        client = await pool.connect();

        let query = `
            SELECT e.*, c.* FROM enrollment e LEFT JOIN courses c ON e.course_id = c.id WHERE 1=1
        `;

        let values = [];

        if (course_id) {
            query += ` AND e.course_id = $1`;
            values.push(course_id);
        }

        if (search) {
            query += ` AND e.course_id IN (SELECT id FROM courses WHERE title ILIKE $${values.length + 1} OR category ILIKE $${values.length + 1})`;
            values.push(`%${search}%`);
        }

        query += ` ORDER BY e.enrollment_date DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

        values.push(limit, offset);

        const enrolledCourses = await client.query(query, values);
        res.status(200).json({ enrolledCourses: enrolledCourses.rows });

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
    viewMyEnrolledCourses,
    viewAllEnrolledStudents
};
