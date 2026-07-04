const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Follow = require('../models/Follow');
const asyncHandler = require('../utils/asyncHandler');
const { decoratePosts } = require('../utils/stats');

const postValidation = [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Post must be between 1 and 500 characters.')
];

const commentValidation = [
  body('text').trim().isLength({ min: 1, max: 220 }).withMessage('Comment must be between 1 and 220 characters.')
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

function imagePath(req) {
  return req.file ? `/uploads/${req.file.filename}` : '';
}

async function notify(recipient, actor, type, post) {
  if (String(recipient) === String(actor)) return;
  await Notification.create({ recipient, actor, type, post });
}

const getFeed = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(parseInt(req.query.limit || '8', 10), 20);
  const scope = req.query.scope || 'all';
  const filter = {};

  if (req.query.author) filter.author = req.query.author;
  if (scope === 'following') {
    const following = await Follow.find({ followerId: req.user._id }).select('followingId');
    filter.author = { $in: [...following.map((item) => item.followingId), req.user._id] };
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'username avatar bio createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Post.countDocuments(filter)
  ]);

  res.json({
    posts: await decoratePosts(posts, req.user._id),
    page,
    hasMore: page * limit < total
  });
});

const trendingPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate('author', 'username avatar bio')
    .sort({ createdAt: -1 })
    .limit(40);
  const decorated = await decoratePosts(posts, req.user._id);
  decorated.sort((a, b) => (b.likeCount + b.commentCount * 2) - (a.likeCount + a.commentCount * 2));
  res.json({ posts: decorated.slice(0, 5) });
});

const createPost = asyncHandler(async (req, res) => {
  assertValid(req);
  const post = await Post.create({
    author: req.user._id,
    content: req.body.content,
    image: imagePath(req)
  });
  const populated = await post.populate('author', 'username avatar bio createdAt');
  const [decorated] = await decoratePosts([populated], req.user._id);
  res.status(201).json({ post: decorated });
});

const updatePost = asyncHandler(async (req, res) => {
  assertValid(req);
  const post = await Post.findById(req.params.id);
  if (!post) {
    const error = new Error('Post not found.');
    error.statusCode = 404;
    throw error;
  }
  if (String(post.author) !== String(req.user._id)) {
    const error = new Error('You can only edit your own posts.');
    error.statusCode = 403;
    throw error;
  }

  post.content = req.body.content;
  if (req.file) post.image = imagePath(req);
  await post.save();
  const populated = await post.populate('author', 'username avatar bio createdAt');
  const [decorated] = await decoratePosts([populated], req.user._id);
  res.json({ post: decorated });
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    const error = new Error('Post not found.');
    error.statusCode = 404;
    throw error;
  }
  if (String(post.author) !== String(req.user._id)) {
    const error = new Error('You can only delete your own posts.');
    error.statusCode = 403;
    throw error;
  }
  await Promise.all([
    Comment.deleteMany({ postId: post._id }),
    Notification.deleteMany({ post: post._id }),
    post.deleteOne()
  ]);
  res.json({ message: 'Post deleted.' });
});

const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'username avatar bio');
  if (!post) {
    const error = new Error('Post not found.');
    error.statusCode = 404;
    throw error;
  }

  const userId = String(req.user._id);
  const liked = post.likes.some((id) => String(id) === userId);
  post.likes = liked ? post.likes.filter((id) => String(id) !== userId) : [...post.likes, req.user._id];
  await post.save();
  if (!liked) await notify(post.author._id, req.user._id, 'like', post._id);

  const [decorated] = await decoratePosts([post], req.user._id);
  res.json({ post: decorated });
});

const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ postId: req.params.id })
    .populate('userId', 'username avatar bio')
    .sort({ createdAt: 1 });
  res.json({ comments });
});

const addComment = asyncHandler(async (req, res) => {
  assertValid(req);
  const post = await Post.findById(req.params.id);
  if (!post) {
    const error = new Error('Post not found.');
    error.statusCode = 404;
    throw error;
  }
  const comment = await Comment.create({ postId: post._id, userId: req.user._id, text: req.body.text });
  await notify(post.author, req.user._id, 'comment', post._id);
  const populated = await comment.populate('userId', 'username avatar bio');
  res.status(201).json({ comment: populated });
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    const error = new Error('Comment not found.');
    error.statusCode = 404;
    throw error;
  }
  if (String(comment.userId) !== String(req.user._id)) {
    const error = new Error('You can only delete your own comments.');
    error.statusCode = 403;
    throw error;
  }
  await comment.deleteOne();
  res.json({ message: 'Comment deleted.' });
});

module.exports = {
  getFeed,
  trendingPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getComments,
  addComment,
  deleteComment,
  postValidation,
  commentValidation
};
