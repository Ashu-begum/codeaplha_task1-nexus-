const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const Post = require('../models/Post');

async function userStats(userId) {
  const [followersCount, followingCount, postsCount] = await Promise.all([
    Follow.countDocuments({ followingId: userId }),
    Follow.countDocuments({ followerId: userId }),
    Post.countDocuments({ author: userId })
  ]);

  return { followersCount, followingCount, postsCount };
}

async function decoratePosts(posts, viewerId) {
  const ids = posts.map((post) => post._id);
  const commentCounts = await Comment.aggregate([
    { $match: { postId: { $in: ids } } },
    { $group: { _id: '$postId', count: { $sum: 1 } } }
  ]);
  const countMap = new Map(commentCounts.map((item) => [String(item._id), item.count]));

  return posts.map((post) => {
    const item = post.toObject({ virtuals: true });
    item.likeCount = item.likes.length;
    item.likedByMe = viewerId ? item.likes.some((id) => String(id) === String(viewerId)) : false;
    item.commentCount = countMap.get(String(item._id)) || 0;
    item.likes = undefined;
    return item;
  });
}

module.exports = { userStats, decoratePosts };
