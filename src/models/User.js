const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 28,
    match: [/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, dots, and underscores.']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 180,
    default: ''
  },
  onboardingComplete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.virtual('avatarUrl').get(function avatarUrl() {
  if (this.avatar) return this.avatar;
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(this.username)}`;
});

module.exports = mongoose.model('User', userSchema);
