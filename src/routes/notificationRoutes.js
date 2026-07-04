const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getNotifications } = require('../controllers/notificationController');

const router = express.Router();

router.use(protect);
router.get('/', getNotifications);

module.exports = router;
