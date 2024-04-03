const pool = require('../db');

// GET all courses
const getAllCourses = async (req, res) => {
    const { category, level, popularity, rating, search } = req.query;

    let client;
    try {
        client = await pool.connect();

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const filters = [];

        if (category) filters.push(`category = '${category}'`);
        if (level){
            // Validate level
            const validLevels = ['Beginner Friendly', 'Intermediate', 'Easy', 'Hard', 'Expert'];
            if (!validLevels.includes(level)) {
                return res.status(400).json({ msg: 'Invalid course level' });
            }
            filters.push(`level = '${level}'`);
        }
        if (popularity) filters.push(`popularity >= ${popularity}`); 
        if (rating) filters.push(`rating >= ${rating}`);   
        if (search) filters.push(`(title ILIKE '%${search}%' OR category ILIKE '%${search}%')`)

        let filterQuery = '';
        if (filters.length > 0) {
            filterQuery = 'WHERE ' + filters.join(' AND ');
        }

        // Fetch courses based on filters and pagination
        const query = `SELECT * FROM courses ${filterQuery} ORDER BY id LIMIT $1 OFFSET $2`;
        const result = await client.query(query, [limit, offset]);

        console.log(result.rowCount)
        res.json(result.rows);

    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ msg: 'Internal server error' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

// GET course by ID
const getCourseById = async (req, res) => {
    const courseId = req.params.id;
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('SELECT * FROM courses WHERE id = $1', [courseId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching course by ID:', err);
        res.status(500).json({ msg: 'Internal server error' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

// POST create a new course
const createCourse = async (req, res) => {
    const { title, description, category, popularity, start_date, end_date, level, discount = 0, instructors, price, requirements = [], skills_learned, rating } = req.body;

    if(!title || !description || !category || !popularity || !start_date || !end_date || !level || !price){
        return res.status(400).json({ msg: "Provide all fields" });
    }

    const durationInMilliseconds = Math.abs(new Date(end_date) - new Date(start_date));
    const millisecondsInWeek = 7 * 24 * 60 * 60 * 1000; // 1 week = 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
    const duration = Math.ceil(durationInMilliseconds / millisecondsInWeek);

    // Validate rating
    if(!rating || rating > 5 || rating < 0 ){
        res.status(400).json({msg: "Invalid Rating"});
    }
    // Validate level
    const validLevels = ['Beginner Friendly', 'Intermediate', 'Easy', 'Hard', 'Expert'];
    if (!validLevels.includes(level)) {
        return res.status(400).json({ msg: 'Invalid course level' });
    }

    // discounted price
    const new_price = price - parseInt((price * (discount / 100)));

    // Validate skills_learned
    if (!skills_learned || skills_learned.length === 0) {
        return res.status(400).json({ msg: 'Skills learned cannot be empty' });
    }

    // Validate intructors
    if(instructors && instructors.length === 0){
        return res.status(400).json({ msg: "Min 1 intructor should be given" });
    }
    
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('INSERT INTO courses (title, description, category, popularity, duration, level, instructors, price, discount, new_price , start_date, end_date, requirements, skills_learned, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *', [title, description, category, popularity, duration, level, instructors, price, discount, new_price, start_date, end_date, requirements, skills_learned, rating]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating course:', err);
        res.status(400).json({ msg: 'Bad request' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

// PUT update course by ID
const updateCourseById = async (req, res) => {
    const courseId = req.params.id;
    const { title, description, category, popularity, level, instructors, price, discount, start_date, end_date, requirements = [], skills_learned, rating } = req.body;

    // Validate rating
    if(!rating || rating > 5 || rating < 0 ){
        res.status(400).json({msg: "Invalid Rating"});
    }
    // Validate level
    const validLevels = ['Beginner Friendly', 'Intermediate', 'Easy', 'Hard', 'Expert'];
    if (!validLevels.includes(level)) {
        return res.status(400).json({ msg: 'Invalid course level' });
    }

    // Duration
    const durationInMilliseconds = Math.abs(new Date(end_date) - new Date(start_date));
    const millisecondsInWeek = 7 * 24 * 60 * 60 * 1000; // 1 week = 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
    const duration = Math.ceil(durationInMilliseconds / millisecondsInWeek);

    // Discounted Price
    let new_price = 0;
    if(discount && price){
        new_price = price - parseInt(( price * (discount / 100) ));
    }

    let client;
    try {
        client = await pool.connect();
        const result = await client.query('UPDATE courses SET title = $1, description = $2, category = $3, popularity = $4, duration = $5, level = $6, instructors = $7, price = $8, start_date = $9, end_date = $10, requirements = $11, skills_learned = $12, rating = $13, discount = $14, new_price = $15 WHERE id = $14 RETURNING *', [title, description, category, popularity, duration, level, instructors, price, start_date, end_date, requirements, skills_learned, rating, discount, new_price, courseId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating course:', err);
        res.status(400).json({ msg: 'Bad request' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

// DELETE course by ID
const deleteCourseById = async (req, res) => {
    const courseId = req.params.id;
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('DELETE FROM courses WHERE id = $1 RETURNING *', [courseId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.json({ msg: 'Course deleted successfully' });
    } catch (err) {
        console.error('Error deleting course:', err);
        res.status(500).json({ msg: 'Internal server error' });
    } finally {
        if (client) {
            client.release();
        }
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourseById,
    deleteCourseById
};
