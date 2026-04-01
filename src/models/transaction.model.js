const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense', 'transfer'],
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: false,
  },
});

TransactionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

TransactionSchema.set('toJSON', {
  virtuals: true,
});

module.exports = mongoose.model('Transaction', TransactionSchema);