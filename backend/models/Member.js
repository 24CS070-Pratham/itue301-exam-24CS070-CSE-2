const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    membershipType: {
      type: String,
      enum: {
        values: ['basic', 'premium', 'platinum'],
        message: 'Membership type must be either basic, premium, or platinum',
      },
      default: 'basic',
    },
    role: {
      type: String,
      enum: ['Member', 'Admin', 'Trainer'],
      default: 'Member',
    },
  },
  {
    timestamps: true,
  }
);

// Method to remove password from JSON output
memberSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Member', memberSchema);
