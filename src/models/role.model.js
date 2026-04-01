const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  role_name: {
    type: String,
    required: true,
    enum: ['viewer', 'analyst', 'admin'],
  },
}, {
  timestamps: false,
});

RoleSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

RoleSchema.set('toJSON', {
  virtuals: true,
});

module.exports = mongoose.model('Role', RoleSchema);
