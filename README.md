# Faculty Activity Tracker

A full-stack faculty performance tracking system with separate faculty, HOD, and admin workflows.

The application lets faculty submit activities, allows HOD/Admin review and approval, stores supporting proof documents, and calculates capped API scores by category.

## Modules

- `frontend/`: React + Vite single-page application
- `backend/`: Express API with PostgreSQL

## Core Features

- Faculty login and first-time password setup
- Admin-created user accounts
- Faculty activity submission with proof link or file upload
- Rejected activity modification and resubmission
- HOD/Admin review workflow
- Faculty dashboard with category-wise API totals
- Admin analytics and user directory
- Narrative reporting by category
- Category-capped API score calculation

## Existing College Context

This project is intended to fit into an already running college workflow rather than replace every existing academic or ERP system.

- It acts as a focused faculty activity tracking and documentation layer
- It supports structured submission, review, approval, and reporting for faculty contributions
- It is suitable for institutional record keeping, annual reporting, and API-style score consolidation
- It can coexist with existing college systems that already handle HR, payroll, timetable, student records, or broader ERP functions

## How This Project Maps To Existing Systems

In a typical college setup, this project can be positioned as the faculty activity and documentation module.

- `Faculty Portal` maps to day-to-day submission of teaching, research, and co-curricular activities
- `HOD Portal` maps to department-level scrutiny and first-stage approval
- `Admin Portal` maps to institution-level review, user management, reporting, and export for documentation
- `Narratives + CSV export` map to annual report preparation, accreditation support, and internal documentation needs
- `API score summary` maps to a decision-support layer for evaluation, not a replacement for formal policy review

This makes the project practical in production because it complements an existing system instead of forcing a full platform migration.

## Roles

- `Faculty`
  - View dashboard
  - Submit activities
  - View rejected activities and submit them again after modification
- `HOD`
  - Review department activities
  - Approve or reject submissions
  - View department reports
- `Admin`
  - Create users
  - Review all activities
  - View institution-wide analytics and reports

## Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM
- Axios
- Recharts
- Lucide React

### Backend

- Node.js
- Express
- PostgreSQL

## Project Structure

```text
faculty-activity-tracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── uploads/
│   ├── migrateApiScores.js
│   ├── fixDb.js
│   ├── fixPaths.js
│   ├── seedCsv.js
│   ├── seedUsers.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── public/
├── faculty.csv
└── README.md
```

## Environment Variables

### Backend

Create `backend/.env` for local development.

Minimum required:

```env
DATABASE_URL=postgresql://username:password@host:5432/database_name
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

### Important Notes

- The backend now uses `DATABASE_URL` directly.
- Keep `DATABASE_URL` configured in the service environment.
- SSL is enabled automatically for production-style hosted PostgreSQL URLs.

## Installation

### 1. Clone the project

```bash
git clone <your-repo-url>
cd faculty-activity-tracker
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## Running Locally

### Backend

From `backend/`:

```bash
node server.js
```

or

```bash
npx nodemon server.js
```

The backend:

- connects to PostgreSQL using `DATABASE_URL`
- runs runtime schema checks on startup

### Frontend

From `frontend/`:

```bash
npm run dev
```

For production build:

```bash
npm run build
```

## Frontend API Base URL

The current frontend API client is configured in `frontend/src/services/api.js`.

Right now it points to:

- `https://faculty-activity-tracker.onrender.com/api/v1`

If you want to run frontend against a local backend, update that file before local testing.

## Database Notes

The backend performs safe runtime schema checks during startup:

- adds missing score columns in `api_scores`
- adds missing `quantity` and `suggested_score` in `activities`
- ensures category compatibility for existing activity types

These checks are additive only. They are not intended to delete data.

## Scalability

The current architecture is suitable for scaled institutional use within a college environment.

- PostgreSQL provides a stable relational base for users, submissions, scores, and narratives
- The backend is stateless enough to be deployed behind a managed hosting platform such as Render
- Role-based access keeps workflows separated across Faculty, HOD, and Admin users
- Score aggregation is cached in `api_scores`, which avoids recalculating every dashboard view from scratch
- CSV export and report-style admin views support operational documentation without needing direct database access

For broader scale across multiple departments or campuses, the next improvements would typically be:

- environment-based frontend API configuration
- stronger audit logging for approvals and edits
- background jobs for heavier exports or mail workflows
- pagination and filtering on large activity/report tables
- object storage strategy for uploaded proof documents

## API Score Logic

API scores are calculated only from `Approved` activities.

### Category Caps

- `Teaching`: `100`
- `Co-curricular / Service`: `30`
- `Research`: `100`

### Final Score Formula

```text
teaching_score = min(sum(approved Teaching assigned_score), 100)
co_curricular_score = min(sum(approved Co-curricular/Service assigned_score), 30)
research_score = min(sum(approved Research assigned_score), 100)
total_score = teaching_score + co_curricular_score + research_score
```

This prevents one category from dominating the full API score.

## Output Screens

### Login Page
![Faculty Dashboard](imgs/Screenshot%20(1).png)

### Faculty Portal
![Faculty Activity View](imgs/Screenshot%20(2).png)
![Faculty Submission Form](imgs/Screenshot%20(3).png)
![HOD or Review Queue](imgs/Screenshot%20(4).png)

### Review And Approval
![Admin Analytics](imgs/Screenshot%20(6).png)

### Admin Portal
![Admin Review View](imgs/Screenshot%20(5).png)
![Admin User Directory](imgs/Screenshot%20(7).png)
![Admin Faculty Report](imgs/Screenshot%20(8).png)
![CSV or Report Output](imgs/Screenshot%20(9).png)

## Main Backend Routes

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/check-email`
- `POST /api/v1/auth/setup-password`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/all`
- `POST /api/v1/auth/admin/users`

### Activities

- `POST /api/v1/activities`
- `GET /api/v1/activities`
- `PUT /api/v1/activities/:id/resubmit`
- `GET /api/v1/activities/department`
- `GET /api/v1/activities/all`
- `PUT /api/v1/activities/:id/review`

### Dashboard

- `GET /api/v1/dashboard/faculty`
- `GET /api/v1/dashboard/admin/analytics`
- `GET /api/v1/dashboard/admin/graphs`

### Narratives

- narrative APIs are available under `/api/v1/narratives`


## Utility Scripts Kept In Repo

- `backend/seedCsv.js`
  - seed users from `faculty.csv`
- `backend/seedUsers.js`
  - seed basic users manually
- `backend/migrateApiScores.js`
  - additive migration for score-related fields
- `backend/fixDb.js`
  - sets a default department for existing users
- `backend/fixPaths.js`
  - normalizes stored proof document paths

Use them carefully and review the code before running them against production.

## Known Limitations

- The frontend API base URL is hardcoded to the deployed backend by default.
- Email service configuration is currently not fully environment-driven and should be cleaned before production hardening.
- The current API scoring logic is a practical implementation for this project and not a full digital implementation of every UGC 2018 scoring rule.

## License

This project is licensed under the MIT License.
