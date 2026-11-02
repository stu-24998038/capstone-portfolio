const Comment = require('../models/Comment');
const BlogPost = require('../models/BlogPost');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const assertPostExists = async (postId) => {
  const exists = await BlogPost.exists({ _id: postId });
  if (!exists) throw new ApiError(404, 'Blog post not found.');
};

/** GET /api/blog/:postId/comments — public. */
const getComments = asyncHandler(async (req, res) => {
  await assertPostExists(req.params.postId);

  const comments = await Comment.find({ post: req.params.postId })
    .populate('author', 'username')
    .sort({ createdAt: 1 });

  res.status(200).json(comments);
});

/** POST /api/blog/:postId/comments — protected. */
const addComment = asyncHandler(async (req, res) => {
  await assertPostExists(req.params.postId);

  const comment = await Comment.create({
    body: req.body.body,
    author: req.user._id,
    post: req.params.postId,
  });
  await comment.populate('author', 'username');

  res.status(201).json(comment);
});

/** DELETE /api/blog/:postId/comments/:commentId — comment author or post author. */
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findOne({
    _id: req.params.commentId,
    post: req.params.postId,
  });
  if (!comment) throw new ApiError(404, 'Comment not found.');

  const post = await BlogPost.findById(req.params.postId).select('author');
  if (!post) throw new ApiError(404, 'Blog post not found.');

  const isCommentAuthor = String(comment.author) === String(req.user._id);
  const isPostAuthor = String(post.author) === String(req.user._id);

  if (!isCommentAuthor && !isPostAuthor) {
    throw new ApiError(403, 'You can only delete your own comments.');
  }

  await comment.deleteOne();
  res.status(200).json({ success: true, message: 'Comment deleted.', id: req.params.commentId });
});

module.exports = { getComments, addComment, deleteComment };
