const Message = require('../models/Message');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** POST /api/contact — public contact form. */
const createMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  await Message.create({ name, email, message });

  res.status(201).json({
    success: true,
    message: "Thanks for reaching out. I'll be in touch soon.",
  });
});

/** GET /api/contact — protected inbox. */
const getMessages = asyncHandler(async (_req, res) => {
  const messages = await Message.find().sort({ read: 1, createdAt: -1 });
  res.status(200).json(messages);
});

/** PATCH /api/contact/:id/read — protected, toggles read state. */
const markMessageRead = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) throw new ApiError(404, 'Message not found.');

  message.read = typeof req.body.read === 'boolean' ? req.body.read : !message.read;
  await message.save();

  res.status(200).json(message);
});

/** DELETE /api/contact/:id — protected. */
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) throw new ApiError(404, 'Message not found.');

  await message.deleteOne();
  res.status(200).json({ success: true, message: 'Message deleted.', id: req.params.id });
});

module.exports = { createMessage, getMessages, markMessageRead, deleteMessage };
