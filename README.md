# Smart Campus Issue Reporting System

A full-stack web application where students can report campus issues (damaged furniture,
water leakage, electrical faults, cleanliness problems, etc.) and campus staff can track
and resolve them. Issues are automatically categorized and prioritized using a rule-based
engine, and every status change is tracked and shown to the student.

> **New to coding?** Don't worry — this README explains every single step, in order,
> assuming you have never run a Node.js project before. Follow it top to bottom.

---

## 1. What's inside

- **Frontend**: React + Vite + TypeScript + Tailwind CSS, talking to the backend over REST APIs.
- **Backend**: Node.js + Express + TypeScript + Prisma ORM, with JWT authentication.
- **Database**: PostgreSQL (run easily with Docker).

```
smart-campus-issue-reporting/
├── frontend/       # React app (what you see in the browser)
├── backend/        # Express API + Prisma (the server + database logic)
├── docker-compose.yml   # Starts PostgreSQL for you
└── README.md       # You are here
```

## 2. Features

**Students** can register, log in, report an issue (with title, description, category,
location and an optional photo), see it get an automatic category + priority, and track
it through Reported → In Progress → Resolved, with notifications on every status change.

**Admins / campus staff** can log in, see every issue, search/filter/sort them, change
status and priority, assign issues to staff, leave comments, view uploaded photos, manage
users and manage issue categories, and see analytics dashboards (issues by category,
status, priority, building, and over time).

**Smart categorization & prioritization**: a rule-based service scans the issue's title
and description for keywords (e.g. "leak" → Plumbing, "danger"/"hazard" → High priority)
and assigns a category and priority automatically. The reasoning is shown on the issue's
details page. This service is written so a real AI API could later be swapped in without
changing any other code (see `backend/src/services/categorization.ts`).

**Community & engagement features**:
- **"Me too" upvotes** — students can back an existing open issue instead of filing a duplicate; upvote counts feed staff priority decisions.
- **Duplicate detection** — before submitting, the report form checks open issues in the same building/floor for keyword overlap and offers to upvote instead.
- **Post-resolution ratings** — once an issue is `RESOLVED`, the reporting student can leave a 1–5 star rating + comment, rolled up into the admin analytics dashboard as a staff-performance metric.
- **Location QR codes** (`/admin/qr-codes`) — generate a QR sticker per building/floor that deep-links to the report form with the location pre-filled.
- **Campus Fixes Leaderboard** (`/leaderboard`) — credits reward getting issues resolved, upvoting real problems, and rating fixes (not just filing complaints), with badges (🛠️ Problem Solver, 🌱 Clean Campus, 💡 Safety Watch, 🏆 Campus Contributor).
- **Student Polls** (`/polls` for students, `/admin/polls` to manage) — admins post recurring campus-decision polls; students vote once and see live percentages.

---

## 3. Requirements (install these first)

You need three things installed on your computer:

1. **Node.js** (version 18 or newer) — [download here](https://nodejs.org/). This also
   installs `npm`, which you'll use to install project dependencies.
   Check it worked by opening a terminal and running:
   ```bash
   node -v
   npm -v
   ```
2. **Docker Desktop** — [download here](https://www.docker.com/products/docker-desktop/).
   This is the easiest way to run PostgreSQL without installing it manually.
   Check it worked:
   ```bash
   docker -v
   ```
3. **VS Code** — [download here](https://code.visualstudio.com/) (you probably already
   have this since you're opening the project in it).

You do **not** need to install PostgreSQL separately — Docker will run it for you.

---

## 4. Step-by-step setup

Open the `smart-campus-issue-reporting` folder in VS Code, then open a terminal inside
VS Code (menu: Terminal → New Terminal). Run all commands below from that terminal.

### Step 1 — Start the database

From the **project root** (the top-level `smart-campus-issue-reporting` folder):

```bash
docker compose up -d
```

This downloads and starts a PostgreSQL database in the background. You can check it's
running with `docker ps` — you should see a container named `smart-campus-postgres`.

### Step 2 — Set up the backend

```bash
cd backend
cp .env.example .env
npm install
```

Open the new `backend/.env` file and make sure `DATABASE_URL` matches the database
started by Docker (it already does, by default — you don't need to change anything for
local development). If you like, change `JWT_SECRET` to any random string.

Now create the database tables and load demo data:

```bash
npm run prisma:migrate
npm run prisma:seed
```

`prisma:migrate` will ask you to name the migration — just press Enter to accept the
default name (`init`), or type a name and press Enter.

Start the backend server:

```bash
npm run dev
```

You should see: `Smart Campus API listening on http://localhost:5000`. Leave this
terminal running.

### Step 3 — Set up the frontend

Open a **second terminal** in VS Code (Terminal → New Terminal), then:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

You should see a message with a local URL, usually `http://localhost:5173`. Leave this
terminal running too.

### Step 4 — Open the app

Go to **http://localhost:5173** in your browser. You should see the landing page.

---

## 5. Demo credentials

The seed script creates these accounts for you (these are demo credentials — please
change them before deploying anywhere real):

| Role  | Email               | Password    |
|-------|---------------------|-------------|
| Admin | admin@campus.com    | Admin@123   |
| Student | student@campus.com | Student@123 |

15+ sample issues across all categories and statuses are pre-loaded so the dashboards
and lists aren't empty when you first log in.

---

## 6. Trying it out

1. Log in as the **student** account → go to "Report Issue" → fill the form
   (try a description containing "leak" or "danger" to see auto-categorization/priority
   in action) → submit → you'll get an issue ID and see it in "My Issues".
2. Open the issue's details page to see its status timeline and priority reasoning.
3. Log out, log in as the **admin** account → go to "All Issues" → open the issue you
   just created → change its status to "In Progress", add a comment, assign it to staff.
4. Log back in as the student → check "Notifications" — you'll see a notification about
   the status change.
5. As admin, check "Analytics" for charts of issues by category, status, priority,
   building, and over time.

---

## 7. Environment variables

**backend/.env**
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign login tokens — use a long random string |
| `JWT_EXPIRES_IN` | How long a login session lasts (default `7d`) |
| `PORT` | Port the API runs on (default `5000`) |
| `CLIENT_URL` | Frontend origin, used for CORS (default `http://localhost:5173`) |
| `MAX_FILE_SIZE_MB` | Max image upload size in MB (default `5`) |

**frontend/.env**
| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (default `http://localhost:5000/api`) |

---

## 8. Database schema (Prisma models)

- **User** — id, name, email, password (hashed), role (`STUDENT`/`ADMIN`), timestamps
- **Issue** — title, description, category, priority, priorityReason, status, location
  fields (building/floor/room/area/lat/lng), imageUrl, reporter, assignedTo, timestamps
- **IssueStatusHistory** — every status change (or comment) on an issue, with who changed
  it and when
- **Notification** — messages sent to students when their issue's status changes or gets
  a comment
- **Category** — manageable list of issue categories

See `backend/prisma/schema.prisma` for the full definitions with relationships.

---

## 9. API documentation

All endpoints are prefixed with `/api`. Protected endpoints require an
`Authorization: Bearer <token>` header (the frontend handles this automatically once
you're logged in).

**Auth**
- `POST /auth/register` — `{ name, email, password }`
- `POST /auth/login` — `{ email, password }`
- `POST /auth/logout` — (protected)
- `GET /auth/me` — (protected) current user

**Issues** (protected)
- `POST /issues` — multipart form: `title, description, building, floor, room?, area?, image?`
- `GET /issues` — query params: `status, category, priority, search, page, limit`
  (students automatically see only their own issues)
- `GET /issues/:id`
- `PUT /issues/:id`
- `DELETE /issues/:id`

**Admin only**
- `PUT /issues/:id/status` — `{ status, comment? }`
- `PUT /issues/:id/priority` — `{ priority }`
- `PUT /issues/:id/assign` — `{ assignedToId }`
- `POST /issues/:id/comments` — `{ comment }`
- `GET /users`, `GET /users/:id`
- `GET /analytics/dashboard`

**Categories**
- `GET /categories` (any logged-in user)
- `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id` (admin only)

**Notifications** (protected)
- `GET /notifications`
- `PUT /notifications/:id/read`

All responses follow `{ success: boolean, data?, message?, pagination? }`.

---

## 10. Troubleshooting

- **`npm run prisma:migrate` fails / can't reach database** — make sure
  `docker compose up -d` is running (`docker ps` should show `smart-campus-postgres`),
  and that `DATABASE_URL` in `backend/.env` matches.
- **Frontend shows network errors** — make sure the backend terminal is still running
  and shows `listening on http://localhost:5000`, and that `frontend/.env`'s
  `VITE_API_URL` points at it.
- **Port already in use** — another process is using port 5000, 5173 or 5432. Stop it,
  or change the port in the relevant `.env` file / `docker-compose.yml`.
- **Login fails with "Invalid email or password"** — double check you ran
  `npm run prisma:seed` in the backend, and that you're using the demo credentials above.
- **Image upload fails** — only JPG/JPEG/PNG files under 5MB are accepted.
- **Want a clean slate?** Run `npm run prisma:seed` again in `backend/` — it clears and
  recreates all issues/notifications/history (it does not delete users).

---

## 11. Future improvements

- Swap the rule-based `categorization.ts` service for a real AI/LLM API call (it's
  already isolated behind a single `analyzeIssue()` function for this purpose).
- Move image storage to Cloudinary/S3 for production (currently local disk under
  `backend/uploads/`).
- Add email notifications in addition to in-app notifications.
- Add map-based location picking using the existing `latitude`/`longitude` fields.
- Add refresh tokens / token rotation for longer-lived sessions.

---

## 12. Security notes

Passwords are hashed with bcrypt and never stored in plain text. Authentication uses
JWTs validated on every protected request. Role-based middleware prevents students from
calling admin-only endpoints. Uploads are validated for file type and size on both the
frontend and backend. `helmet` and `cors` are enabled, and login/register endpoints are
rate-limited. No secrets are committed — copy `.env.example` to `.env` and fill in real
values before deploying anywhere.
