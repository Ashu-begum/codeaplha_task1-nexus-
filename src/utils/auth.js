function signToken(res, userId) {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return token;
}

function publicUser(user, extras = {}) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt,
    onboardingComplete: user.onboardingComplete,
    ...extras
  };
}

module.exports = { signToken, publicUser };
