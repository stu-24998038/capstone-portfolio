const mongoose = require('mongoose');

const httpOrRelativeUrl = (value) =>
  !value || /^(https?:\/\/|\/)/i.test(value);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A project title is required.'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters.'],
    },
    description: {
      type: String,
      required: [true, 'A project description is required.'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters.'],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: httpOrRelativeUrl,
        message: 'Image URL must start with http://, https://, or /.',
      },
    },
    repoUrl: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: httpOrRelativeUrl,
        message: 'Repository URL must start with http://, https://, or /.',
      },
    },
    liveUrl: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: httpOrRelativeUrl,
        message: 'Live URL must start with http://, https://, or /.',
      },
    },
    techStack: {
      type: [{ type: String, trim: true, maxlength: 40 }],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    year: {
      type: String,
      trim: true,
      maxlength: [12, 'Year cannot exceed 12 characters.'],
      default: () => String(new Date().getFullYear()),
    },
    accent: {
      type: String,
      enum: {
        values: ['terracotta', 'olive', 'ink', 'sand', 'clay', 'sky'],
        message: 'Accent must be one of: terracotta, olive, ink, sand, clay, sky.',
      },
      default: 'terracotta',
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'Order cannot be negative.'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A project must belong to a user.'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

projectSchema.index({ featured: -1, order: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
