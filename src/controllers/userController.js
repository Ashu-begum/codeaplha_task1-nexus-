const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const { publicUser } = require('../utils/auth');
const { userStats } = require('../utils/stats');
const asyncHandler = require('../utils/asyncHandler');

const profileValidation = [
  body('username').optional().trim().isLength({ min: 3, max: 28 }).matches(/^[a-zA-Z0-9._]+$/),
  body('bio').optional().trim().isLength({ max: 180 })
];

function assertValid(req) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const error = new Error('Please check the highlighted fields.');
    error.statusCode = 422;
    error.errors = result.array();
    throw error;
  }
}

async function relationToViewer(userId, viewerId) {
  const isFollowing = await Follow.exists({ followerId: viewerId, followingId: userId });
  return { isFollowing: Boolean(isFollowing), isMe: String(userId) === String(viewerId) };
}

function completionFor(user) {
  const checks = [
    Boolean(user.avatar),
    Boolean(user.bio && user.bio.length > 20),
    Boolean(user.username),
    Boolean(user.email),
    Boolean(user.onboardingComplete)
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  res.json({
    user: publicUser(user, {
      ...(await userStats(user._id)),
      ...(await relationToViewer(user._id, req.user._id)),
      completion: completionFor(user)
    })
  });
});

const updateMe = asyncHandler(async (req, res) => {
  assertValid(req);
  if (req.body.username) {
    const taken = await User.findOne({ username: req.body.username, _id: { $ne: req.user._id } });
    if (taken) {
      const error = new Error('That username is already taken.');
      error.statusCode = 409;
      throw error;
    }
    req.user.username = req.body.username;
  }
  if (typeof req.body.bio === 'string') req.user.bio = req.body.bio;
  if (req.file) req.user.avatar = `/uploads/${req.file.filename}`;
  req.user.onboardingComplete = true;
  await req.user.save();

  res.json({ user: publicUser(req.user, { ...(await userStats(req.user._id)), completion: completionFor(req.user) }) });
});

const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  const query = q ? {
    $or: [
      { username: new RegExp(q, 'i') },
      { bio: new RegExp(q, 'i') }
    ]
  } : {};

  const users = await User.find(query).limit(12).sort({ createdAt: -1 });
  const following = await Follow.find({ followerId: req.user._id }).select('followingId');
  const set = new Set(following.map((item) => String(item.followingId)));

  res.json({
    users: await Promise.all(users.map(async (user) => publicUser(user, {
      ...(await userStats(user._id)),
      isMe: String(user._id) === String(req.user._id),
      isFollowing: set.has(String(user._id))
    })))
  });
});

const suggestedUsers = asyncHandler(async (req, res) => {
  const following = await Follow.find({ followerId: req.user._id }).select('followingId');
  const ignored = [req.user._id, ...following.map((item) => item.followingId)];
  const users = await User.find({ _id: { $nin: ignored } }).sort({ createdAt: -1 }).limit(5);
  res.json({ users: await Promise.all(users.map(async (user) => publicUser(user, await userStats(user._id)))) });
});

const toggleFollow = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    const error = new Error('You cannot follow yourself.');
    error.statusCode = 400;
    throw error;
  }

  const target = await User.findById(req.params.id);
  if (!target) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const existing = await Follow.findOne({ followerId: req.user._id, followingId: target._id });
  if (existing) {
    await existing.deleteOne();
  } else {
    await Follow.create({ followerId: req.user._id, followingId: target._id });
    await Notification.create({ recipient: target._id, actor: req.user._id, type: 'follow' });
  }

  res.json({
    isFollowing: !existing,
    user: publicUser(target, {
      ...(await userStats(target._id)),
      isFollowing: !existing,
      isMe: false
    })
  });
});

const followers = asyncHandler(async (req, res) => {
  const follows = await Follow.find({ followingId: req.params.id })
    .populate('followerId', 'username avatar bio createdAt')
    .sort({ createdAt: -1 });
  res.json({ users: follows.map((item) => publicUser(item.followerId)) });
});

const following = asyncHandler(async (req, res) => {
  const follows = await Follow.find({ followerId: req.params.id })
    .populate('followingId', 'username avatar bio createdAt')
    .sort({ createdAt: -1 });
  res.json({ users: follows.map((item) => publicUser(item.followingId)) });
});

module.exports = {
  getProfile,
  updateMe,
  searchUsers,
  suggestedUsers,
  toggleFollow,
  followers,
  following,
  profileValidation
};
