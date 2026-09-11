# AYUSH-SETU — SIH 2026 (PS 26044)

Skill Intelligence & Academia–Industry Collaboration Platform.
MVP scope: Student, Industry, and Institution/Admin roles, a deterministic
explainable skill-matching engine, and a skill-demand-vs-supply dashboard.

This is a real, runnable project — not snippets. Follow the steps below in order.

## 1. Prerequisites

- Node.js 20+ installed
- A free MongoDB Atlas cluster (see the build guide, Section 3.2) — or a local MongoDB instance
- Two terminal windows (one for backend, one for frontend)

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

```
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<any long random string>
```

Seed demo data (creates sample student/industry/institution accounts and a
couple of opportunities, so the app isn't empty on stage):

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

It should print `MongoDB connected` and `Server running on port 5000`.
Leave this terminal running.

## 3. Frontend setup

Open a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env
```

The default `.env` (`VITE_API_URL=http://localhost:5000/api`) already matches
the backend above — no changes needed for local development.

Start the frontend:

```bash
npm run dev
```

Open the printed URL (usually `http://localhost:5173`).

## 4. Demo logins (after running `npm run seed`)

| Role        | Email                  | Password    |
|-------------|-------------------------|-------------|
| Student     | student1@demo.com       | password123 |
| Industry    | industry1@demo.com      | password123 |
| Institution | institution1@demo.com   | password123 |

You can also register brand-new accounts from the Register page for any role.

## 5. What's already wired up

- Register/Login with JWT, role-based routing (student / industry / institution)
- Student: skill profile, add skills manually, upload a resume PDF to
  auto-extract skills (offline, no external API key needed)
- Student: browse opportunities, apply, see an instant explainable match score
- Industry: post an opportunity with required skills, view ranked applicants,
  shortlist / reject
- Institution: live skill-demand-vs-supply chart, headline stat cards

## 6. Deploying (optional, see the build guide Sections 11 & 21)

- Backend → Render.com (free tier). Set the same env vars as your local `.env`,
  plus `CLIENT_URL` = your deployed frontend URL.
- Frontend → Vercel (free tier). Set `VITE_API_URL` = your deployed backend
  URL + `/api`.

## 7. Project structure

```
ayush-setu/
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── models/            User, StudentProfile, Opportunity, Application
│   ├── middleware/         auth, role, errorHandler
│   ├── routes/              auth, profile, opportunities, applications, analytics
│   ├── utils/                matchEngine.js, resumeParser.js
│   └── seed/seed.js         demo data
└── frontend/
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/     DashboardShell, StatCard, MatchBadge, SkillGapChart, ProtectedRoute
        └── pages/            Login, Register, StudentDashboard, Opportunities,
                              IndustryDashboard, InstitutionDashboard
```

## 8. Companion documents

- `AYUSH-SETU_Build_Guide.docx` — the full day-by-day build narrative, free-API
  list, cut list, and demo script.
- `SIH2026_PS26044_Idea_Presentation.pptx` — the official-format idea PPT.

Good luck — build the loop, seed the data, rehearse the demo.
