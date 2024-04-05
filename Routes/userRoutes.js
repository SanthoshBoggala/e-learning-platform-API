const express = require('express');
const upload = require('../Services/upload')
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById
} = require('../Controllers/userControllers');

// Routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', upload.single('image') , createUser);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUserById);

module.exports = router;
