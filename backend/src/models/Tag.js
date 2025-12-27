const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      lowercase: true,
      maxlength: [50, 'Tag name cannot exceed 50 characters'],
    },
    color: {
      type: String,
      enum: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'],
      default: 'gray',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Unique tag name per user
tagSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Tag', tagSchema);
