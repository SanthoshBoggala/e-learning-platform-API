const express = require('express');
const upload = require('../Services/upload')
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  loginUser,
  updateUserById,
  deleteUserById,
  passwordReset
} = require('../Controllers/userControllers');

// Middlewares
const validateStudent = require('../Middlewares/validateStudent');
const validateAdmin = require('../Middlewares/validateAdmin');

// Routes
router.get('/all', validateAdmin, getAllUsers);
router.get('/', validateStudent,  getUserById);
router.post('/register', upload.single('image') , createUser);
router.post('/login', loginUser);
router.put('/', validateStudent, upload.single('image') , updateUserById);
router.delete('/', validateStudent, deleteUserById);
router.post('/student/reset-password', validateStudent, passwordReset);
router.post('/admin/reset-password', validateAdmin, passwordReset);


module.exports = router;
