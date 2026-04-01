const mongoose = require('mongoose');
const Role = require('./role.model');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active',
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: false,
  },
});

module.exports = mongoose.model('User', UserSchema);