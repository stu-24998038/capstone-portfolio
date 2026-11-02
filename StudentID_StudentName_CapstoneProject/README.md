# Folio — Full-Stack Portfolio & Blog

**Course:** Web Data Management and Application  
**Project:** Cumulative Full-Stack Capstone Project  
**Student:** `[Your Name]` · `[Your Student ID]`

A production-ready personal portfolio and blog built with **React**, **Node.js/Express**, **Mongoose**, and **MongoDB Atlas**.

The public side is an editorial portfolio: selected projects, a journal, project case studies, and a contact form. The private side is a JWT-protected admin desk for creating, editing, and deleting projects and journal notes, plus an inbox for contact messages. Signed-in visitors can join the conversation with comments on journal notes.

---

## Preview

| Home | Work |
| --- | --- |
| ![Portfolio home page](docs/screenshots/home.png) | ![Projects gallery](docs/screenshots/projects.png) |

| Journal | Admin dashboard |
| --- | --- |
| ![Journal page](docs/screenshots/journal.png) | ![Admin dashboard](docs/screenshots/admin.png) |

<p align="center">
  <img src="docs/screenshots/mobile-home.png" alt="Mobile home page" width="260" />
</p>

More screenshots, including the journal detail page, contact form, login screen, project form, inbox, and mobile menu, are in [`docs/screenshots`](docs/screenshots).

---

## 1. Live URLs

| Service | URL | Status |
| --- | --- | --- |
| Front-end SPA | `https://YOUR-CLIENT.vercel.app` | Replace after deploying the `client` folder |
| Back-end API | `https://YOUR-API.onrender.com` | Replace after deploying the `server` folder |
| API health check | `https://YOUR-API.onrender.com/api/health` | Should return `{"success":true,"status":"ok"}` |

> **Before submitting to Chaoxing:** replace the two placeholder URLs above with the real deployment URLs, then re-export the ZIP. Deployment steps are in [section 10](#10-deployment).

---

## 2. What the project includes

### Back-end (50 marks)

- MVC structure: `models`, `controllers`, `routes`, `middleware`, `config`, `utils`.
- Five Mongoose models with validation: **User, Project, BlogPost, Comment, Message**.
- MongoDB Atlas connection with connection lifecycle handling.
- Passwords hashed with **bcrypt** (12 salt rounds); `password` is `select: false` and is never returned by the API.
- **JWT** authentication (`jsonwebtoken`) with a `protect` middleware that verifies the Bearer token and loads `req.user`.
- Author-only update/delete rules for blog posts; owner-only update/delete rules for projects.
- Full project CRUD, blog CRUD, comment create/read, contact create, and a protected message inbox.
- `populate()` for project owners, post authors, and comment authors.
- Central error handler with consistent JSON, Mongoose validation/cast handling, duplicate-key handling, and JWT error messages.
- **helmet**, **CORS allow-list**, **express-rate-limit**, JSON body limits, and NoSQL operator sanitisation.
- Integration test suite (Node test runner + Supertest + `mongodb-memory-server`) covering auth, authorization, CRUD, comments, contact, and error responses.
- Seed script with demo projects, journal notes, comments, and inbox messages.

### Front-end (50 marks)

- React 18 SPA built with Vite and React Router.
- Auth-aware Header, responsive mobile menu, and persistent Footer.
- Pages: Home/About, Projects, Project detail, Journal, Journal detail, Contact, Login, Register, Admin, 404.
- `AuthContext` manages token, user, login, registration, logout, and session restoration from `localStorage`.
- Protected `/admin` route redirects unauthenticated visitors to `/login` and returns them to the dashboard afterwards.
- Controlled forms with inline validation, loading states, retry states, and toast feedback.
- Admin dashboard with project create/edit/delete, post create/edit/delete, and message read/delete.
- Journal comments for signed-in users.
- Responsive Tailwind design, custom typography, local SVG artwork, accessible focus states, reduced-motion support, and 404 page.
- Production build verified; SPA rewrites included for Vercel and Netlify.

### Tech stack

| Layer | Tools |
| --- | --- |
| Client | React 18, React Router 6, Vite 5, Tailwind CSS 3, lucide-react, react-markdown |
| Server | Node.js 20+, Express 5, Mongoose 8, JWT, bcrypt, express-validator |
| Database | MongoDB Atlas |
| Security | helmet, CORS allow-list, rate limiting, bcrypt, JWT |
| Testing | Node test runner, Supertest, mongodb-memory-server |
| Deployment | Render (API), Vercel or Netlify (SPA), MongoDB Atlas |

---

## 3. Project structure

```text
capstone-portfolio/
├── client/                     # React SPA
│   ├── public/                 # favicon and static assets
│   ├── src/
│   │   ├── api/                # fetch wrapper + endpoint helpers
│   │   ├── components/         # shared UI + admin forms
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── hooks/              # document-title hook
│   │   ├── pages/              # public pages + Admin
│   │   ├── utils/              # formatting helpers
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── netlify.toml
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── vite.config.js
├── docs/screenshots/           # UI reference screenshots
├── server/                     # Express API
│   ├── src/
│   │   ├── config/             # env + database connection
│   │   ├── controllers/        # auth, project, blog, comment, contact
│   │   ├── middleware/         # protect, errors, validation, rate limits
│   │   ├── models/             # User, Project, BlogPost, Comment, Message
│   │   ├── routes/             # /api/users, /api/projects, /api/blog, /api/contact
│   │   ├── seed/               # seed data + CLI
│   │   ├── utils/              # ApiError, asyncHandler, JWT helper
│   │   ├── app.js
│   │   ├── demo.js             # zero-setup in-memory demo server
│   │   └── server.js
│   ├── tests/api.test.js
│   └── .env.example
├── render.yaml                 # Render blueprint for the API
├── package.json                # npm workspaces + root scripts
└── README.md
```

---

## 4. Run locally

### Prerequisites

- Node.js **20 or newer**
- npm 10 or newer
- A MongoDB Atlas cluster (or use the zero-setup demo in 4A)

### 4A. Zero-setup demo (recommended for a quick look)

The demo starts an **ephemeral in-memory MongoDB**, seeds it, and runs the API. No Atlas account or `.env` file is needed. Data disappears when the process stops.

From the project root:

```bash
npm install
npm run demo
```

Then open **http://localhost:5173**.

Demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin / author | `admin@folio.dev` | `Admin123!` |
| Reader | `maya@folio.dev` | `Reader123!` |

> The demo mode is for local previews and marking; the graded deployment uses MongoDB Atlas through `MONGODB_URI`.

### 4B. Full local setup with MongoDB Atlas

1. Create a free MongoDB Atlas cluster and a database user.
2. Add your current IP under **Network Access** (or `0.0.0.0/0` for a hosted API, if your provider requires it).
3. Copy the connection string and add a database name, for example:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/folio?retryWrites=true&w=majority`
4. Create the environment files:

```bash
# macOS / Linux
cp server/.env.example server/.env
cp client/.env.example client/.env

# Windows PowerShell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

5. Edit `server/.env` and set at minimum:

```dotenv
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=replace-with-a-long-random-string
CLIENT_URL=http://localhost:5173
```

6. Install, seed, and run from the **project root**:

```bash
npm install
npm run seed
npm run dev
```

7. Open:

- SPA: **http://localhost:5173**
- API: **http://localhost:5000**
- Health: **http://localhost:5000/api/health**

The seed script prints the admin credentials it created. If the user already exists, the existing password is left unchanged.

### Running the two apps separately

```bash
# Terminal 1
cd server
npm install
npm run dev

# Terminal 2
cd client
npm install
npm run dev
```

### Front-end → back-end connection

The client reads `VITE_API_URL` at build time. For local development:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

If the variable is omitted, the client falls back to `http://localhost:5000/api`.

After changing `.env`, restart the Vite dev server. For a deployed build, set `VITE_API_URL` in Vercel/Netlify **before** rebuilding.

---

## 5. Environment variables

### `server/.env`

| Variable | Required | Purpose | Example |
| --- | --- | --- | --- |
| `NODE_ENV` | Recommended | `development`, `test`, or `production` | `production` |
| `PORT` | No | API port (Render sets this automatically) | `5000` |
| `MONGODB_URI` | **Yes** | MongoDB Atlas connection string with database name | `mongodb+srv://.../folio` |
| `JWT_SECRET` | **Yes** | Secret used to sign JWTs; 32+ chars in production | `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | No | Token lifetime | `7d` |
| `CLIENT_URL` | **Yes in production** | Comma-separated CORS allow-list | `https://folio.vercel.app` |
| `ADMIN_USERNAME` | No | Seed account username | `alex` |
| `ADMIN_EMAIL` | No | Seed account email | `admin@folio.dev` |
| `ADMIN_PASSWORD` | No | Seed account password | `Admin123!` |

### `client/.env`

| Variable | Required | Purpose | Example |
| --- | --- | --- | --- |
| `VITE_API_URL` | **Yes for deployment** | Full API base URL including `/api` | `https://folio-api.onrender.com/api` |

**Never commit real `.env` files.** They are excluded by `.gitignore`; use `.env.example` as the template.

---

## 6. API reference

**Base URL (local):** `http://localhost:5000/api`  
**Base URL (deployed):** `https://YOUR-API.onrender.com/api`

### Conventions

- Request and response bodies are JSON.
- Protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

- Successful collection reads return a JSON **array** (`GET /api/projects`, `GET /api/blog`).
- Successful single resources return the resource object.
- Errors use a consistent shape:

```json
{
  "success": false,
  "message": "Please check the highlighted fields.",
  "errors": [{ "field": "email", "message": "Enter a valid email address." }]
}
```

### Status codes

| Code | Meaning |
| --- | --- |
| `200` | Success |
| `201` | Created |
| `400` | Malformed id / body syntax |
| `401` | Missing, invalid, or expired token; bad login |
| `403` | Authenticated but not the owner/author, or CORS blocked |
| `404` | Resource or route not found |
| `409` | Duplicate email/username |
| `422` | Validation error |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error |

### Health

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Uptime + database connection state |
| `GET` | `/` | Public | API name, version, docs hint |

### Users / authentication

| Method | Endpoint | Auth | Body | Purpose |
| --- | --- | --- | --- | --- |
| `POST` | `/api/users/register` | Public | `username`, `email`, `password` | Create account, hash password, return JWT |
| `POST` | `/api/users/login` | Public | `email`, `password` | Verify password, return JWT |
| `GET` | `/api/users/me` | Bearer | — | Return the current user (session restore) |

**Register request**

```json
{
  "username": "alex",
  "email": "admin@folio.dev",
  "password": "Admin123!"
}
```

**Auth success response**

```json
{
  "success": true,
  "message": "Your account is ready. Welcome in.",
  "token": "eyJhbGciOi...",
  "user": {
    "_id": "66f1...",
    "username": "alex",
    "email": "admin@folio.dev",
    "createdAt": "2026-11-02T10:00:00.000Z",
    "updatedAt": "2026-11-02T10:00:00.000Z"
  }
}
```

`password` is never included in any response.

### Projects

| Method | Endpoint | Auth | Body / params | Purpose |
| --- | --- | --- | --- | --- |
| `GET` | `/api/projects` | Public | — | All projects, featured first, with owner username |
| `GET` | `/api/projects/:id` | Public | `id` | One project with owner username |
| `POST` | `/api/projects` | Bearer | Project fields | Create and attach to `req.user` |
| `PUT` | `/api/projects/:id` | Bearer + owner | Partial project fields | Update |
| `DELETE` | `/api/projects/:id` | Bearer + owner | `id` | Delete |

**Project body**

```json
{
  "title": "Northstar Analytics",
  "description": "A decision-support workspace for climate teams.",
  "imageUrl": "https://example.com/cover.jpg",
  "repoUrl": "https://github.com/example/northstar",
  "liveUrl": "https://example.com/northstar",
  "techStack": ["React", "Node.js", "MongoDB"],
  "featured": true,
  "year": "2026",
  "accent": "sky",
  "order": 1
}
```

Required on create: `title`, `description`. `imageUrl`, `repoUrl`, `liveUrl`, `techStack`, `featured`, `year`, `accent`, and `order` are optional. `accent` is one of `terracotta`, `olive`, `ink`, `sand`, `clay`, `sky`.

### Blog posts

| Method | Endpoint | Auth | Body / params | Purpose |
| --- | --- | --- | --- | --- |
| `GET` | `/api/blog` | Public | — | All posts, featured/newest first, author populated |
| `GET` | `/api/blog/:id` | Public | `id` | One post with author + all comments |
| `POST` | `/api/blog` | Bearer | Post fields | Create, author = `req.user` |
| `PUT` | `/api/blog/:id` | Bearer + author | Partial post fields | Update — **author only** |
| `DELETE` | `/api/blog/:id` | Bearer + author | `id` | Delete — **author only**; comments are removed too |

**Blog post body**

```json
{
  "title": "Designing for the in-between",
  "content": "## The screen is not the experience\n\nMarkdown is supported.",
  "excerpt": "Optional summary. Generated from the content if omitted.",
  "coverImage": "https://example.com/cover.jpg",
  "tags": ["Design", "Process"],
  "featured": true
}
```

Required on create: `title`, `content`. The API adds `readTime` (virtual) and timestamps. If `excerpt` is omitted, it is generated from the content.

### Comments

| Method | Endpoint | Auth | Body / params | Purpose |
| --- | --- | --- | --- | --- |
| `GET` | `/api/blog/:postId/comments` | Public | `postId` | All comments for a post, author populated |
| `POST` | `/api/blog/:postId/comments` | Bearer | `{ "body": "..." }` | Add a comment as `req.user` |
| `DELETE` | `/api/blog/:postId/comments/:commentId` | Bearer + owner | params | Comment author or post author may delete |

### Contact / inbox

| Method | Endpoint | Auth | Body / params | Purpose |
| --- | --- | --- | --- | --- |
| `POST` | `/api/contact` | Public | `name`, `email`, `message` | Save a portfolio contact message |
| `GET` | `/api/contact` | Bearer | — | Protected inbox, unread first |
| `PATCH` | `/api/contact/:id/read` | Bearer | `{ "read": true }` | Mark read/unread |
| `DELETE` | `/api/contact/:id` | Bearer | `id` | Delete a message |

**Contact request**

```json
{
  "name": "Jordan Lee",
  "email": "jordan@example.com",
  "message": "I would love to talk about a project this autumn."
}
```

### Quick `curl` examples

```bash
# Health
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alex","email":"admin@folio.dev","password":"Admin123!"}'

# Login and capture the token (jq required)
TOKEN=$(curl -s -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@folio.dev","password":"Admin123!"}' | jq -r .token)

# Create a project
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"New project","description":"A short description."}'

# Public reads
curl http://localhost:5000/api/projects
curl http://localhost:5000/api/blog
```

---

## 7. Data model

```text
User (1) ───< Project        (Project.user      → User)
User (1) ───< BlogPost       (BlogPost.author   → User)
User (1) ───< Comment        (Comment.author    → User)
BlogPost (1) ───< Comment    (Comment.post      → BlogPost)

Message is standalone (contact form)
```

| Model | Fields | Notes |
| --- | --- | --- |
| `User` | `username`, `email`, `password` | Unique username/email; bcrypt hash; timestamps |
| `Project` | `title`, `description`, `imageUrl`, `repoUrl`, `liveUrl`, `techStack`, `featured`, `year`, `accent`, `order`, `user` | `user` required, ref `User`; URLs validated |
| `BlogPost` | `title`, `content`, `excerpt`, `coverImage`, `tags`, `featured`, `author` | `author` required, ref `User`; timestamps; `readTime` virtual |
| `Comment` | `body`, `author`, `post` | Both refs required; timestamps |
| `Message` | `name`, `email`, `message`, `read` | Contact form; timestamps |

Indexes cover unique users, project ordering, post recency, comments by post, and message unread state.

---

## 8. Security notes

- Passwords are hashed with **bcrypt** before save and compared only on login.
- `password` uses `select: false` and is stripped in `toJSON`.
- JWT is verified on every protected request; the user is re-loaded from the database.
- Blog updates/deletes require the original author. Project updates/deletes require the owner.
- **helmet** sets secure HTTP headers; `x-powered-by` is disabled.
- **CORS** uses an allow-list from `CLIENT_URL`; localhost ports are allowed only outside production.
- **express-rate-limit** limits the whole API, auth attempts, and contact submissions.
- Request bodies are limited to 1 MB and keys beginning with `$` or containing `.` are stripped to reduce NoSQL injection risk.
- Mongoose schema validation and express-validator provide layered input validation.
- Secrets live in environment variables; `.env` files are git-ignored.
- The API returns generic messages for unexpected 500 errors in production.

For a real personal deployment, create the owner account, keep `ADMIN_PASSWORD` private, and consider closing public registration or adding role-based access if the site will be shared widely.

---

## 9. Testing

```bash
# From the repository root
npm test
```

The suite uses Node's built-in test runner, Supertest, and an ephemeral MongoDB instance provided by `mongodb-memory-server`. The first run may download a MongoDB binary; later runs are faster.

Covered flows:

1. Health endpoint + security headers.
2. Registration validation, password hashing, no password leakage.
3. Duplicate email → `409`.
4. Login failure/success, JWT, `/me`.
5. Protected routes reject missing/invalid tokens.
6. Project CRUD + non-owner `403`.
7. Blog create/list/detail + author-only `403`.
8. Public comment reads, protected comment creation.
9. Contact validation, inbox access, read toggle, delete.
10. Post deletion cascades comments.
11. Unknown routes and malformed ObjectIds return consistent JSON.

Manual checks used for the UI: Home, Work, project detail, Journal, note detail, Contact, Login, Register, Admin project/post CRUD, comments, mobile navigation, and the 404 page.

**Final local verification (2 November 2026):**

- API suite: **16 passed, 0 failed**.
- Production build: **passed** (`vite build`; no console errors in the rendered app).
- Browser smoke flow: protected-route redirect, contact validation + submission, reader comment, admin journal create/update/delete, inbox read/delete, logout protection, 404, and mobile navigation — **all passed**.
- Layout checks: no horizontal overflow at 1440 px or 390 px.

---

## 10. Deployment

### 10.1 MongoDB Atlas

1. Create a cluster and database user.
2. Create database `folio` (or let the first write create it).
3. Network Access → allow your API host. Render's outbound IPs vary; `0.0.0.0/0` is the simplest option for a course deployment, with a strong database password.
4. Copy the SRV connection string and include `/folio` before the query string.

### 10.2 API on Render

**Option A — Blueprint**

1. Push the project to GitHub.
2. In Render, choose **New → Blueprint** and select the repository. `render.yaml` creates a free web service with root directory `server`.
3. Fill the secret values when prompted:
   - `MONGODB_URI`
   - `JWT_SECRET` (or let Render generate it)
   - `CLIENT_URL` — your Vercel URL, e.g. `https://folio.vercel.app`
4. Deploy. Health check: `https://YOUR-API.onrender.com/api/health`.

**Option B — Manual web service**

- Root directory: `server`
- Build command: `npm install --omit=dev`
- Start command: `npm start`
- Environment: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`

Seed the deployed database once from your machine (using the Atlas URI in `server/.env`):

```bash
cd server
npm run seed
```

Or create the first account by registering through the deployed site.

> Render's free tier sleeps after inactivity. The first request may take 30–60 seconds; the UI shows loading and retry states for this reason.

### 10.3 Client on Vercel

1. Import the repository.
2. Set **Root Directory** to `client`.
3. Framework preset: **Vite**. Build command `npm run build`; output `dist`.
4. Add environment variable:
   - `VITE_API_URL` = `https://YOUR-API.onrender.com/api`
5. Deploy. The included `vercel.json` rewrites all routes to `index.html`, so React Router deep links work.

### 10.4 Client on Netlify (alternative)

1. Base directory: `client`.
2. Build command: `npm run build`; publish directory: `client/dist` (relative to repo root).
3. Add `VITE_API_URL`.
4. `client/netlify.toml` already contains the SPA redirect.

### 10.5 Final CORS wiring

After the front-end URL is known, set on Render:

```dotenv
CLIENT_URL=https://your-project.vercel.app
```

For multiple origins, comma-separate them:

```dotenv
CLIENT_URL=https://your-project.vercel.app,https://your-project-git-main.vercel.app
```

Redeploy the API after changing environment variables. Then hard-refresh the SPA and verify:

- `GET /api/health` returns connected.
- Projects and journal load on the deployed SPA.
- Login works and `/admin` is reachable.
- Creating/editing/deleting a project and note works.
- A comment posts and appears.
- The contact form returns success and the message appears in the admin inbox.

---

## 11. Packaging for Chaoxing

The ZIP must exclude `node_modules` and real `.env` files.

A helper script is included:

```powershell
# Windows PowerShell, from the project root
.\scripts\package-submission.ps1 -StudentId "12345678" -StudentName "YourName"
```

This creates `StudentID_StudentName_CapstoneProject.zip` in the project root, excluding `node_modules`, `dist`, `.env`, `.npm-cache`, `.tmp`, `.tools`, and `.mongodb-binaries`.

Manual alternative:

```powershell
# Use a staging folder so the archive never sees node_modules.
New-Item -ItemType Directory -Force ..\submission-staging | Out-Null
robocopy . ..\submission-staging /E /XD node_modules dist .git .npm-cache .tmp .tools .mongodb-binaries /XF .env *.zip
Compress-Archive -Path ..\submission-staging\* -DestinationPath "StudentID_StudentName_CapstoneProject.zip" -Force
Remove-Item ..\submission-staging -Recurse -Force
```

Before uploading:

- [ ] Replace live URLs in this README.
- [ ] Replace `[Your Name]` and `[Your Student ID]`.
- [ ] Confirm `README.md` is at the ZIP root.
- [ ] Confirm no `node_modules` or `.env` files are inside.
- [ ] Test the deployed API health URL and front-end URL in a private browser window.
- [ ] Keep demo accounts or create a fresh admin account for the viva.

---

## 12. Demo content and customisation

- All names, projects, journal entries, comments, and messages are fictional demo content.
- Social links in the footer/contact page point to GitHub/LinkedIn home pages — replace them with your own profiles.
- The contact email `hello@alexchen.dev` is illustrative; change it in:
  - `client/src/pages/Contact.jsx`
  - `client/src/components/Footer.jsx`
  - `client/src/pages/Home.jsx`
- Project artwork is generated from the `accent` field; you can also supply a real `imageUrl` from the admin form.
- Journal cover images are optional; without one, the app renders a typographic cover.
- The site name/brand lives in `client/index.html`, `client/src/components/Logo.jsx`, `client/src/components/HeroCard.jsx`, and the footer.

---

## 13. Credits

- Typefaces: **Fraunces** and **DM Sans**, self-hosted through Fontsource (SIL Open Font License). No external font requests are required at runtime.
- Icons: **lucide-react** (ISC).
- Markdown rendering: **react-markdown** + **remark-gfm**.
- All application code and demo copy were written for this capstone project.
