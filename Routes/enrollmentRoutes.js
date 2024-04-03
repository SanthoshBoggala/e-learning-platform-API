const express = require('express');
const router = express.Router();

const { 
    enroll,
    viewAllEnrolledCourses,
    viewAllEnrolledStudents
} = require('../Controllers/enrollmentControllers');

router.post('/', enroll);
router.get('/user-courses', viewAllEnrolledCourses);
router.get('/courses', viewAllEnrolledStudents);

module.exports = router;
