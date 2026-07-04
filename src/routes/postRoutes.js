const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const {
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
} = require('../controllers/postController');

const router = express.Router();

router.use(protect);
router.get('/', getFeed);
router.get('/trending', trendingPosts);
router.post('/', upload.single('image'), postValidation, createPost);
router.patch('/:id', upload.single('image'), postValidation, updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.get('/:id/comments', getComments);
router.post('/:id/comments', commentValidation, addComment);
router.delete('/comments/:id', deleteComment);

module.exports = router;
