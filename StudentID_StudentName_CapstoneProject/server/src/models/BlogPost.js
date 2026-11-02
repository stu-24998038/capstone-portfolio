const mongoose = require('mongoose');

const httpOrRelativeUrl = (value) =>
  !value || /^(https?:\/\/|\/)/i.test(value);

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A post title is required.'],
      trim: true,
      maxlength: [160, 'Title cannot exceed 160 characters.'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required.'],
      maxlength: [50000, 'Content cannot exceed 50,000 characters.'],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [320, 'Excerpt cannot exceed 320 characters.'],
      default: '',
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: httpOrRelativeUrl,
        message: 'Cover image must start with http://, https://, or /.',
      },
    },
    tags: {
      type: [{ type: String, trim: true, maxlength: 30 }],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A post must have an author.'],
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

blogPostSchema.virtual('readTime').get(function readTime() {
  const words = String(this.content || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
});

blogPostSchema.pre('validate', function createExcerpt() {
  if (this.excerpt || !this.content) return;
  this.excerpt = String(this.content)
    .replace(/[#*_>`\[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
});

blogPostSchema.index({ featured: -1, createdAt: -1 });
blogPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('BlogPost', blogPostSchema);
