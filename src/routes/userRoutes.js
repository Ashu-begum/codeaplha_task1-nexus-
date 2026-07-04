const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateMe,
  searchUsers,
  suggestedUsers,
  toggleFollow,
  followers,
  following,
  profileValidation
} = require('../controllers/userController');

const router = express.Router();

router.use(protect);
router.get('/search', searchUsers);
router.get('/suggested', suggestedUsers);
router.patch('/me', upload.single('avatar'), profileValidation, updateMe);
router.get('/:username', getProfile);
router.post('/:id/follow', toggleFollow);
router.get('/:id/followers', followers);
router.get('/:id/following', following);

module.exports = router;
