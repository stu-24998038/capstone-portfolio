const BlogPost = require('../models/BlogPost');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const POST_FIELDS = [
  'title',
  'content',
  'excerpt',
  'coverImage',
  'tags',
  'featured',
];

const normalizeTags = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const buildPayload = (body) => {
  const payload = {};
  for (const field of POST_FIELDS) {
    if (body[field] === undefined) continue;

    if (field === 'tags') {
      payload.tags = normalizeTags(body[field]);
    } else if (field === 'featured') {
      payload.featured = body[field] === true || body[field] === 'true';
    } else if (field === 'excerpt' && !String(body[field]).trim()) {
      // Let the model generate an excerpt from the content.
      continue;
    } else {
      payload[field] = body[field];
    }
  }
  return payload;
};

const ownsPost = (post, userId) => String(post.author?._id || post.author) === String(userId);

/** GET /api/blog — public list, newest first. */
const getPosts = asyncHandler(async (_req, res) => {
  const posts = await BlogPost.find()
    .populate('author', 'username')
    .sort({ featured: -1, createdAt: -1 });
  res.status(200).json(posts);
});

/** GET /api/blog/:id — public post with author and comments. */
const getPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id).populate('author', 'username');
  if (!post) throw new ApiError(404, 'Blog post not found.');

  const comments = await Comment.find({ post: post._id })
    .populate('author', 'username')
    .sort({ createdAt: 1 });

  res.status(200).json({
    ...post.toJSON(),
    comments,
  });
});

/** POST /api/blog — protected. */
const createPost = asyncHandler(async (req, res) => {
  const payload = buildPayload(req.body);
  const post = await BlogPost.create({ ...payload, author: req.user._id });
  await post.populate('author', 'username');
  res.status(201).json(post);
});

/** PUT /api/blog/:id — protected and author-only. */
const updatePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Blog post not found.');
  if (!ownsPost(post, req.user._id)) {
    throw new ApiError(403, 'You can only edit blog posts that you wrote.');
  }

  post.set(buildPayload(req.body));
  await post.save();
  await post.populate('author', 'username');

  res.status(200).json(post);
});

/** DELETE /api/blog/:id — protected and author-only, removes comments too. */
const deletePost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Blog post not found.');
  if (!ownsPost(post, req.user._id)) {
    throw new ApiError(403, 'You can only delete blog posts that you wrote.');
  }

  await Promise.all([
    Comment.deleteMany({ post: post._id }),
    post.deleteOne(),
  ]);

  res.status(200).json({ success: true, message: 'Blog post deleted.', id: req.params.id });
});

module.exports = { getPosts, getPost, createPost, updatePost, deletePost };
