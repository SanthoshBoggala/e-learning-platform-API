const express = require('express');
const router = express.Router();

const { 
    enroll,
    viewMyEnrolledCourses,
    viewAllEnrolledStudents
} = require('../Controllers/enrollmentControllers');

// middlewares
const validateAdmin = require('../Middlewares/validateAdmin');
const validateStudent = require('../Middlewares/validateStudent');

// routes
router.post('/', validateStudent, enroll);
router.get('/my_courses', validateStudent, viewMyEnrolledCourses);
router.get('/courses', validateAdmin, viewAllEnrolledStudents);

module.exports = router;
