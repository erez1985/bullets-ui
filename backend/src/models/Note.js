const mongoose = require('mongoose');

// Bullet subdocument schema
const bulletSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      default: '',
      maxlength: [10000, 'Bullet content cannot exceed 10000 characters'],
    },
    type: {
      type: String,
      enum: ['checkbox', 'bullet'],
      default: 'bullet',
    },
    checked: {
      type: Boolean,
      default: false,
    },
    tags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
    }],
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
    }],
    indent: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Main Note schema
const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Untitled Note',
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    color: {
      type: String,
      enum: ['yellow', 'green', 'blue', 'pink', 'purple', null],
      default: null,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    bullets: [bulletSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for common queries
noteSchema.index({ userId: 1, folderId: 1 });
noteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ userId: 1, 'bullets.tags': 1 });
noteSchema.index({ title: 'text', 'bullets.content': 'text' });

// Pre-save middleware to ensure at least one bullet exists
noteSchema.pre('save', function (next) {
  if (!this.bullets || this.bullets.length === 0) {
    this.bullets = [{
      content: '',
      type: 'bullet',
      checked: false,
      tags: [],
      mentions: [],
      indent: 0,
      order: 0,
    }];
  }
  next();
});

module.exports = mongoose.model('Note', noteSchema);
