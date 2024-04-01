const express = require('express');
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
router.post('/', createUser);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUserById);

module.exports = router;
