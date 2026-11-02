const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const PROJECT_FIELDS = [
  'title',
  'description',
  'imageUrl',
  'repoUrl',
  'liveUrl',
  'techStack',
  'featured',
  'year',
  'accent',
  'order',
];

const normalizeTechStack = (value) => {
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
  for (const field of PROJECT_FIELDS) {
    if (body[field] === undefined) continue;

    if (field === 'techStack') {
      payload.techStack = normalizeTechStack(body[field]);
    } else if (field === 'featured') {
      payload.featured = body[field] === true || body[field] === 'true';
    } else if (field === 'order') {
      const number = Number(body[field]);
      payload.order = Number.isFinite(number) ? number : 0;
    } else {
      payload[field] = body[field];
    }
  }
  return payload;
};

const ownsProject = (project, userId) => {
  const ownerId = project.user?._id || project.user;
  return String(ownerId) === String(userId);
};

/** GET /api/projects — public list, featured first. */
const getProjects = asyncHandler(async (_req, res) => {
  const projects = await Project.find()
    .populate('user', 'username')
    .sort({ featured: -1, order: 1, createdAt: -1 });

  res.status(200).json(projects);
});

/** GET /api/projects/:id — public single project. */
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('user', 'username');
  if (!project) throw new ApiError(404, 'Project not found.');
  res.status(200).json(project);
});

/** POST /api/projects — protected, owner is the signed-in user. */
const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    ...buildPayload(req.body),
    user: req.user._id,
  });
  await project.populate('user', 'username');

  res.status(201).json(project);
});

/** PUT /api/projects/:id — protected, owner only. */
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found.');
  if (!ownsProject(project, req.user._id)) {
    throw new ApiError(403, 'You can only edit projects that you created.');
  }

  project.set(buildPayload(req.body));
  await project.save();
  await project.populate('user', 'username');

  res.status(200).json(project);
});

/** DELETE /api/projects/:id — protected, owner only. */
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found.');
  if (!ownsProject(project, req.user._id)) {
    throw new ApiError(403, 'You can only delete projects that you created.');
  }

  await project.deleteOne();
  res.status(200).json({ success: true, message: 'Project deleted.', id: req.params.id });
});

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
