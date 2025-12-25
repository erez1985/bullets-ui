const mongoose = require('mongoose');

const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Person name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster lookups
personSchema.index({ name: 1 });

module.exports = mongoose.model('Person', personSchema);

