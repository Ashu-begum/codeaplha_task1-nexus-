const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Follow = require('./models/Follow');
const Notification = require('./models/Notification');

dotenv.config();

const users = [
  {
    username: 'maya.codes',
    email: 'maya@nexus.dev',
    password: 'Password123!',
    bio: 'Frontend engineer documenting the messy middle of building polished products.',
    onboardingComplete: true
  },
  {
    username: 'aarav.design',
    email: 'aarav@nexus.dev',
    password: 'Password123!',
    bio: 'Product designer focused on systems, interaction details, and useful constraints.',
    onboardingComplete: true
  },
  {
    username: 'lina.ops',
    email: 'lina@nexus.dev',
    password: 'Password123!',
    bio: 'Growth and operations notes from early-stage teams.',
    onboardingComplete: true
  },
  {
    username: 'noah.data',
    email: 'noah@nexus.dev',
    password: 'Password123!',
    bio: 'Data stories, dashboards, and the occasional chart critique.',
    onboardingComplete: true
  }
];

const postCopy = [
  'Tiny product lesson: the best empty states do not apologize. They point to the next useful action and keep the page feeling alive.',
  'Shipped profile completion today. Small feature, high leverage. It nudges better bios, avatars, and searchable profiles without blocking anyone.',
  'A feed feels faster when it has skeletons, optimistic counters, and no layout jumps. The API matters, but perception does half the work.',
  'Internship portfolio tip: include the boring production details. Validation, auth middleware, error handling, and ownership checks make projects credible.',
  'Working on suggested users with a simple rule first: exclude yourself and people you already follow. Fancy ranking can arrive after usage exists.'
];

async function seed() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
  await mongoose.connect(process.env.MONGO_URI);

  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Follow.deleteMany({}),
    Notification.deleteMany({})
  ]);

  const createdUsers = await User.create(users);
  const [maya, aarav, lina, noah] = createdUsers;

  await Follow.create([
    { followerId: maya._id, followingId: aarav._id },
    { followerId: maya._id, followingId: lina._id },
    { followerId: aarav._id, followingId: maya._id },
    { followerId: lina._id, followingId: maya._id },
    { followerId: noah._id, followingId: maya._id },
    { followerId: noah._id, followingId: aarav._id }
  ]);

  const posts = await Post.create([
    { author: maya._id, content: postCopy[0], likes: [aarav._id, lina._id, noah._id] },
    { author: aarav._id, content: postCopy[1], likes: [maya._id, noah._id] },
    { author: lina._id, content: postCopy[2], likes: [maya._id, aarav._id] },
    { author: noah._id, content: postCopy[3], likes: [maya._id] },
    { author: maya._id, content: postCopy[4], likes: [lina._id] }
  ]);

  await Comment.create([
    { postId: posts[0]._id, userId: aarav._id, text: 'This is exactly the kind of detail teams remember.' },
    { postId: posts[0]._id, userId: lina._id, text: 'Empty states are such an underrated product signal.' },
    { postId: posts[1]._id, userId: maya._id, text: 'Completion bars can be tasteful when they are quiet.' },
    { postId: posts[3]._id, userId: noah._id, text: 'Ownership checks are the portfolio detail I always look for.' }
  ]);

  await Notification.create([
    { recipient: maya._id, actor: aarav._id, post: posts[0]._id, type: 'comment' },
    { recipient: maya._id, actor: lina._id, post: posts[0]._id, type: 'like' },
    { recipient: aarav._id, actor: maya._id, type: 'follow' }
  ]);

  console.log('Seed complete. Login with maya@nexus.dev / Password123!');
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
