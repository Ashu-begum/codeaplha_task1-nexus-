const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { register, login, logout, me, registerValidation, loginValidation } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', protect, me);

module.exports = router;
