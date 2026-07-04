const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Follow = require('../models/Follow');
const { signToken, publicUser } = require('../utils/auth');
const { userStats } = require('../utils/stats');
const asyncHandler = require('../utils/asyncHandler');

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 28 })
    .withMessage('Username must be 3 to 28 characters.')
    .matches(/^[a-zA-Z0-9._]+$/)
    .withMessage('Username can only use letters, numbers, dots, and underscores.'),
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

function throwValidation(req) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const error = new Error(result.array()[0].msg || 'Please check the highlighted fields.');
    error.statusCode = 422;
    error.errors = result.array();
    throw error;
  }
}

const register = asyncHandler(async (req, res) => {
  throwValidation(req);
  const exists = await User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }]
  });
  if (exists) {
    const error = new Error('Email or username is already in use.');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create(req.body);
  signToken(res, user._id);
  res.status(201).json({ user: publicUser(user, await userStats(user._id)) });
});

const login = asyncHandler(async (req, res) => {
  throwValidation(req);
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  signToken(res, user._id);
  res.json({ user: publicUser(user, await userStats(user._id)) });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully.' });
});

const me = asyncHandler(async (req, res) => {
  const stats = await userStats(req.user._id);
  const following = await Follow.find({ followerId: req.user._id }).select('followingId');
  res.json({
    user: publicUser(req.user, {
      ...stats,
      followingIds: following.map((item) => String(item.followingId))
    })
  });
});

module.exports = { register, login, logout, me, registerValidation, loginValidation };
