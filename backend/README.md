# TrustHire AI Backend

A scalable, production-ready Django REST Framework backend for **TrustHire AI** — an Explainable AI Hiring Intelligence Platform.

## Features
- **JWT Authentication**: Secure user login, token refresh, and blacklisting logout using `djangorestframework-simplejwt`.
- **Role-Based Access Control**: Strict view policies separating Candidates, Recruiters, and Admins.
- **Explainable AI Matching**: Heuristic parsing models simulating LLM matching parameters (semantic, skill, experience, trajectory, and trust scores) with complete reasoning explanations.
- **Verification Trust Engine**: Adjusts trust scores based on profile completeness, social URL presences, and Indian college tier calibrations (IIT/NIT).
- **Comprehensive APIs**: Cover companies list/update, job creation, resume uploads, matches, and recruiter/candidate dashboard statistics.

---

## Tech Stack
- **Framework**: Python 3.12, Django 5.x, Django REST Framework
- **Auth**: SimpleJWT (JSON Web Tokens)
- **Database**: PostgreSQL (Production) / SQLite (Zero-config local fallback)
- **Security**: CORS headers, password hashing, and size/format file validators.

---

## Folder Layout
```
backend/
├── manage.py
├── requirements.txt
├── config/                  # Django central configuration settings
├── accounts/                # Custom User, JWT Authentication, Registration
├── companies/               # Company registry & profiles
├── candidates/              # Candidate profile detail, resume upload, dashboards
├── recruiters/              # Recruiter details, recruiters dashboards
├── jobs/                    # Job posting and job analysis schemas
├── resumes/                 # Resume file tracking & parsed JSON analysis
├── rankings/                # Ranking metrics holding match scores
├── analytics/               # Metrics and stats aggregation
├── ai/                      # AI analysis trigger endpoints
├── services/                # Coordinate parsers, trust, and trajectory layers
└── utils/                   # Custom permission classes and file validators
```

---

## Getting Started

### 1. Prerequisites
- Python 3.12+ installed.

### 2. Environment Setup
Clone the repository and copy the environment template:
```bash
cp .env.example .env
```
Update `.env` values (e.g. `SECRET_KEY`). If `DB_PASSWORD` is omitted, the app will gracefully fall back to local `db.sqlite3` for zero-configuration development.

### 3. Installation
Activate your virtual environment and install dependencies:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Database Migrations
Build and apply the schema migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Running the Test Suite
Ensure all authentication and matching constraints pass successfully:
```bash
python manage.py test
```

### 6. Start the Server
Start the Django development server:
```bash
python manage.py runserver
```
The REST API endpoints will be accessible at `http://127.0.0.1:8000/`.

---

## REST API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - Registers a candidate or recruiter. Returns JWT access/refresh tokens.
- `POST /api/auth/login` - Authenticates user. Returns tokens + user metadata (role, name, email).
- `POST /api/auth/logout` - Blacklists the refresh token.
- `POST /api/auth/refresh` - Obtains a fresh access token.

### 🏢 Companies
- `POST /api/company/create` - Recruiter creates a new company profile.
- `GET /api/company` - List all company records.
- `PUT /api/company/update` - Update company details.

### 💼 Jobs
- `POST /api/jobs/create` - Recruiter posts a job. Triggers automated AI job description parsing.
- `GET /api/jobs` - List jobs (supports location, title, and company filters).
- `GET /api/jobs/{id}` - Retrieve job details with nested analysis.
- `PUT /api/jobs/{id}` - Recruiter updates their job post.
- `DELETE /api/jobs/{id}` - Recruiter deletes their job post.

### 📄 Resumes
- `POST /api/resume/upload` - Uploads a PDF resume and parses it into structured candidate skills, education, and career timeline.
- `GET /api/resume/{id}` - Retrieve detailed parsed resume analysis.

### 📊 Rankings
- `GET /api/rankings/job/{job_id}` - Retrieve ranked list of candidates matching a job.
- `GET /api/rankings/candidate/{candidate_id}` - Retrieve matching jobs ranked for a candidate.

### ⚡ AI Service (Placeholders)
- `POST /api/ai/analyze-job` - Helper to parse raw job descriptions.
- `POST /api/ai/analyze-resume` - Helper to parse raw resume files.
- `POST /api/ai/rank-candidates` - Manually trigger ranking matches.
- `POST /api/ai/generate-trust-report` - Evaluate candidate trust components.
- `POST /api/ai/career-trajectory` - Analyze career velocity.

### 📈 Dashboards
- `GET /api/recruiter/dashboard` - KPIs including total jobs, candidates, average trust, and recent applications.
- `GET /api/candidate/dashboard` - KPIs including resume score, trust score, trajectory direction, and matching jobs.
