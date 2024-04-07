const express = require('express');
const router = express.Router();

const { 
    enroll,
    viewMyEnrolledCourses,
    viewAllEnrolledStudents
} = require('../Controllers/enrollmentControllers');

router.post('/', enroll);
router.get('/my_courses', viewMyEnrolledCourses);
router.get('/courses', viewAllEnrolledStudents);

module.exports = router;
