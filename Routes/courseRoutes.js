const express = require('express');
const router = express.Router();
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourseById,
    deleteCourseById
} = require('../Controllers/courseControllers');

router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', createCourse);
router.put('/:id', updateCourseById);
router.delete('/:id', deleteCourseById);

module.exports = router;
