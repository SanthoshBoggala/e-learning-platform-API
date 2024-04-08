const express = require('express');
const router = express.Router();
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourseById,
    deleteCourseById
} = require('../Controllers/courseControllers');

//middlewares
const validateAdmin = require('../Middlewares/validateAdmin');

// routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', validateAdmin, createCourse);
router.put('/:id', validateAdmin, updateCourseById);
router.delete('/:id', validateAdmin, deleteCourseById);

module.exports = router;
