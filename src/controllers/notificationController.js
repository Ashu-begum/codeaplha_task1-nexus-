const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('actor', 'username avatar bio')
    .populate('post', 'content image')
    .sort({ createdAt: -1 })
    .limit(30);

  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json({ notifications });
});

module.exports = { getNotifications };
