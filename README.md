# TrustHire AI — Explainable Hiring Intelligence Platform

TrustHire AI is an Explainable AI Hiring Platform built for India’s workforce. Instead of rigid keyword matching, it leverages semantic matching, growth trajectory curves, and India-aware fairness adjustments (neutralizing penalties for career gaps, UPSC/GATE preparation, freelancing, and Tier-2/3 college backgrounds).

---

## 🚀 Technology Stack

### Backend
- **Core**: Django REST Framework (DRF)
- **Database**: PostgreSQL (exclusive database setup)
- **Authentication**: JWT verification delegated to **Supabase Auth**
- **AI / Matching Layer**: Gemini API (with deterministic fallback mock engine) + TF-IDF cosine similarity calculations
- **Input Validation**: Pydantic schemas enforcing server-side sanitization

### Frontend
- **Framework**: React + Vite
- **Styling**: Tailwind CSS + Glassmorphism
- **Charts**: Recharts (for trajectory mapping and radar match analytics)
- **Icons**: Lucide React
- **API Client**: Axios with automatic Bearer Auth interceptors

---

## 🔒 Security Architecture (OWASP Compliant)

- **Supabase Auth Integration**: Outsources password storage, hashing (Argon2id), password complexity policies, email verification, and recovery.
- **Strict Server-Side Validation**: All incoming API payloads are parsed via **Pydantic** schemas which strip HTML tags, script scripts, and injection strings.
- **IP-Based Rate Limiting**: Custom Django middleware cache limits auth operations to 10 requests per minute per IP.
- **Security Headers**: Enforced HSTS, Content Security Policy (CSP), X-Frame-Options, X-Content-Type-Options, and Referrer-Policy.
- **Database Audit Logs**: Every job creation, resume upload, and candidate reveal is logged with IP address and user references.

---

## 🛠️ Installation & Setup

### 1. Database Setup
1. Verify PostgreSQL is running on port `5432`.
2. Create a database named `trusthire` using pgAdmin or the CLI:
   ```sql
   CREATE DATABASE trusthire;
   ```

### 2. Backend Setup
1. Change directory to `backend/` and initialize a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   ```
2. Activate the virtual environment:
   - **Windows**: `venv\Scripts\activate`
   - **Mac/Linux**: `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   *Provide your working `DB_PASSWORD`, `SUPABASE_JWT_SECRET`, and optionally `GEMINI_API_KEY`.*
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Seed candidate data to populate dashboards immediately:
   ```bash
   python scratch/seed_data.py
   ```
7. Start the development server:
   ```bash
   python manage.py runserver
   ```

### 3. Frontend Setup
1. Change directory to `frontend/`:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   *Provide your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.*
4. Launch Vite developer server:
   ```bash
   npm run dev
   ```

---

## 📊 Mock Candidate Dataset

When you run `python scratch/seed_data.py`, it inserts:
1. **Rajesh Mehta (Recruiter)** - Posting: *Senior Backend Engineer*
2. **Aarav Sharma (Candidate)** - Tier-3 college, early startup and freelancing experiences. Triggers Tier-3 and freelance context boosts.
3. **Pooja Patel (Candidate)** - IIT Bombay, 2-year career gap for UPSC Civil Services prep. Triggers UPSC exam gap balance boost (+8% score index).
4. **Vikram Kumar (Candidate)** - Tier-3 college, 1.5 yrs experience, basic skills. No adjustments.

Log in using these mock candidate tokens to review dashboard graphs.
