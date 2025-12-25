const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      lowercase: true,
      unique: true,
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

// Index for faster lookups
tagSchema.index({ name: 1 });

module.exports = mongoose.model('Tag', tagSchema);

