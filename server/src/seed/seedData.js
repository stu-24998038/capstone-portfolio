const User = require('../models/User');
const Project = require('../models/Project');
const BlogPost = require('../models/BlogPost');
const Comment = require('../models/Comment');
const Message = require('../models/Message');

const PROJECTS = [
  {
    title: 'Northstar Analytics',
    description:
      'A decision-support workspace for climate teams. I led product design and built the React dashboard, a Node reporting service, and a design system that made dense emissions data feel calm and legible. The result cut weekly reporting time from six hours to forty minutes.',
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'D3'],
    featured: true,
    year: '2026',
    accent: 'sky',
    order: 1,
    repoUrl: 'https://github.com/example/northstar',
    liveUrl: 'https://example.com/northstar',
  },
  {
    title: 'Field Notes',
    description:
      'An editorial travel journal for slow, local journeys. The project pairs a custom CMS with an offline-first reading experience, map-based stories, and a typographic system inspired by printed field guides.',
    techStack: ['React', 'Vite', 'Sanity', 'Mapbox'],
    featured: true,
    year: '2025',
    accent: 'terracotta',
    order: 2,
    repoUrl: 'https://github.com/example/field-notes',
    liveUrl: 'https://example.com/field-notes',
  },
  {
    title: 'Common Ground',
    description:
      'A community events platform that helps neighbourhoods host, find, and fund small gatherings. Built the booking flow, Stripe integration, and an organiser toolkit used by more than 1,200 hosts in its first season.',
    techStack: ['Next.js', 'Prisma', 'Stripe', 'PostgreSQL'],
    featured: false,
    year: '2025',
    accent: 'olive',
    order: 3,
    repoUrl: 'https://github.com/example/common-ground',
    liveUrl: 'https://example.com/common-ground',
  },
  {
    title: 'Quiet Hours',
    description:
      'A small, opinionated focus timer with generated soundscapes. The interface removes almost everything: one dial, one session, and a gentle record of where the hours went. Built with the Web Audio API and a lot of attention to transitions.',
    techStack: ['React', 'Web Audio API', 'Framer Motion'],
    featured: false,
    year: '2024',
    accent: 'sand',
    order: 4,
    repoUrl: 'https://github.com/example/quiet-hours',
    liveUrl: 'https://example.com/quiet-hours',
  },
];

const POSTS = [
  {
    title: 'Designing for the in-between',
    excerpt:
      'The most important parts of a product are rarely the screens we put in the case study. They are the pauses, handoffs, and small moments of doubt in between.',
    tags: ['Design', 'Process'],
    featured: true,
    content: `Most portfolios show the finished thing: the polished dashboard, the confident landing page, the case study with a neat before-and-after. Real products are mostly made of the in-between.

## The screen is not the experience

A user does not experience a button. They experience the second before they press it: the question of what happens next, the memory of a similar tool that failed them, the tiny calculation of whether this is worth the effort.

When I redesigned Northstar's reporting flow, the biggest win was not a chart. It was a loading state that named the exact dataset being fetched. People stopped refreshing the page because they could see the work happening.

## Three questions for the in-between

1. What does the person believe right before this moment?
2. What are they afraid might happen?
3. What would make the next step feel obvious?

These questions are cheaper to answer than another round of pixel polish, and they change the product more.

> Good interface design is mostly the practice of taking someone else's uncertainty seriously.

## Make the pause visible

Empty states, errors, confirmations, and waits are not edge cases. They are the moments when trust is either built or spent. Design them with the same care as the hero section, and the whole product starts to feel more honest.`,
  },
  {
    title: 'A calmer approach to React state',
    excerpt:
      'A few habits that keep component state small, predictable, and easy to delete when the product changes its mind.',
    tags: ['React', 'Engineering'],
    featured: false,
    content: `React state is easy to add and surprisingly hard to remove. These are the habits I keep coming back to when a component starts to feel heavy.

## Start with the smallest owner

Before reaching for a context or a state library, ask which component is the smallest one that actually needs the value. Often it is a single form, not the page. Moving state down is the cheapest refactor available.

## Separate server state from interface state

A list of projects fetched from an API and the open/closed state of a filter are different kinds of data. They have different lifecycles, failure modes, and reasons to change. Keeping them in separate hooks makes both easier to reason about.

## Prefer derived values

If a value can be computed from existing state, compute it during render. Duplicating it in state creates two sources of truth and a class of bugs that only appear after a slow network request.

## Make the loading path a first-class path

Every request can be loading, empty, broken, or successful. I build those four states at the same time as the happy path, with a shared skeleton and a retry action. It takes twenty extra minutes and removes a hundred small surprises.

The goal is not clever state. It is state you can explain to the next person in one sentence.`,
  },
  {
    title: 'What shipping my first product taught me',
    excerpt:
      'Three lessons about scope, feedback, and the difference between a demo and something people can actually rely on.',
    tags: ['Career', 'Product'],
    featured: false,
    content: `My first shipped product was a tiny scheduling tool. It had one job and still managed to teach me more than a year of tutorials.

## Scope is a kindness

Every feature I added made the product harder to explain. The version people loved was the one with fewer choices and a clearer promise. Cutting scope was not giving up; it was making the core idea stronger.

## Feedback is not a feature request

The most useful feedback rarely sounds like "add this". It sounds like "I stopped here because I wasn't sure what would happen". My job was to translate the pause, not just implement the suggestion.

## Reliability is a feature

A demo can be impressive once. A product has to work on a bad connection, at 11pm, for someone who is already frustrated. Error messages, retries, and sensible defaults are not polish. They are the product.

I still keep the first support email I received. It is a good reminder that software only becomes real when someone else depends on it.`,
  },
];

const seedDatabase = async ({ admin, reset = false } = {}) => {
  if (!admin) throw new Error('Seed requires an admin configuration.');

  if (reset) {
    await Promise.all([
      Comment.deleteMany({}),
      BlogPost.deleteMany({}),
      Project.deleteMany({}),
      Message.deleteMany({}),
      User.deleteMany({}),
    ]);
  }

  let adminUser = await User.findOne({ email: admin.email });
  if (!adminUser) {
    adminUser = await User.create({
      username: admin.username,
      email: admin.email,
      password: admin.password,
    });
  }

  let reader = await User.findOne({ email: 'maya@folio.dev' });
  if (!reader) {
    reader = await User.create({
      username: 'maya',
      email: 'maya@folio.dev',
      password: 'Reader123!',
    });
  }

  const projects = [];
  for (const project of PROJECTS) {
    projects.push(
      await Project.findOneAndUpdate(
        { title: project.title },
        { $set: { ...project, user: adminUser._id } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      )
    );
  }

  const posts = [];
  for (const post of POSTS) {
    posts.push(
      await BlogPost.findOneAndUpdate(
        { title: post.title },
        { $set: { ...post, author: adminUser._id } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      )
    );
  }

  const existingComments = await Comment.countDocuments();
  if (existingComments === 0) {
    await Comment.create([
      {
        body: 'The point about designing the pause really lands. Loading and empty states are where most products lose their manners.',
        author: reader._id,
        post: posts[0]._id,
      },
      {
        body: 'Keeping server state and interface state separate has saved me more debugging time than any state library.',
        author: reader._id,
        post: posts[1]._id,
      },
      {
        body: '“Reliability is a feature” is going straight into my next project brief.',
        author: reader._id,
        post: posts[2]._id,
      },
    ]);
  }

  const existingMessages = await Message.countDocuments();
  if (existingMessages === 0) {
    await Message.create([
      {
        name: 'Jordan Lee',
        email: 'jordan@example.com',
        message:
          'Hi Alex — I loved the Field Notes case study. We are rebuilding our travel journal and would love to talk about a design and front-end engagement this autumn.',
      },
      {
        name: 'Priya Raman',
        email: 'priya@example.com',
        message:
          'A quick note to say the Northstar dashboard work is excellent. Do you have capacity for a short product audit in December?',
        read: true,
      },
    ]);
  }

  return {
    admin: adminUser,
    reader,
    counts: {
      projects: projects.length,
      posts: posts.length,
      comments: await Comment.countDocuments(),
      messages: await Message.countDocuments(),
    },
  };
};

module.exports = { seedDatabase };
