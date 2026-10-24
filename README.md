# 🤖 AI Recruitment Platform

An intelligent, full-stack recruitment platform that leverages **Google Gemini AI** to automate resume screening, candidate ranking, interview preparation, and applicant notifications — streamlining the hiring pipeline for recruiters.

![Django](https://img.shields.io/badge/Django-6.0-green?logo=django)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-orange?logo=google)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![Celery](https://img.shields.io/badge/Celery-5.6-brightgreen?logo=celery)
![Redis](https://img.shields.io/badge/Redis-7-red?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)

---

## ✨ Key Features

### 🧠 AI-Powered Engine (Google Gemini)
- **Smart Resume Scoring** — AI evaluates candidate resumes against job descriptions and returns a 0–100 match score.
- **Strength & Gap Analysis** — Automatically identifies applicant strengths, weaknesses, and missing skills.
- **AI Interview Prep** — Generates tailored, role-specific technical interview questions per candidate.
- **AI Job Description Generator & Bias Analyzer** — Helps recruiters create inclusive, structured job postings.

### 👔 Recruiter Dashboard
- Post, edit, and manage company job listings.
- View AI-ranked applicants sorted by resume match score.
- One-click Shortlist / Reject with automated background email notifications.
- Schedule interviews with standard `.ics` calendar invite generation and email dispatch.
- Real-time recruitment analytics and charts (application volume, shortlisting rates).

### 👤 Candidate Portal
- Browse active vacancies with keyword search and filtering.
- Apply directly with PDF resume uploads.
- Track real-time application status and review detailed AI feedback.
- Save jobs for quick access later.

### 🔐 Authentication & Security
- Secure JWT authentication (`access` and `refresh` tokens).
- Role-based access control (Recruiter vs. Candidate permissions).
- Protected API endpoints with object-level permission verification.
- Automatic token refresh on expiration.

---

## 🏗️ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19, Vite 8, React Bootstrap, Tailwind CSS, Recharts | Single Page Application (SPA) |
| **Backend** | Python 3.11+, Django 6.0, Django REST Framework | RESTful API backend |
| **AI Engine** | Google Gemini 2.5 Flash (`google-generativeai`) | Resume parsing, scoring & question generation |
| **Auth** | JWT via `djangorestframework-simplejwt` | Token-based stateless authentication |
| **Task Queue** | Celery 5.6 + Redis 7 | Asynchronous resume scoring & email dispatch |
| **Database** | SQLite (development default) / MySQL / PostgreSQL supported | Relational data persistence |
| **Containerization** | Docker & Docker Compose | Containerized Redis broker & full-stack deployment |
| **Email** | Gmail SMTP with App Passwords | Asynchronous interview invitations and status alerts |

---

## 📁 Project Structure

```
AI-Recruitment-Platform/
├── backend/                        # Django REST API backend
│   ├── ai_engine/                  # Gemini AI services, prompts, and Celery tasks
│   │   ├── services.py             # Resume evaluation & question generation
│   │   └── tasks.py                # Celery async tasks (scoring, emails)
│   ├── analytics/                  # Recruiter dashboard metrics & charts
│   ├── applications/               # Applications, status workflows, calendar .ics utils
│   ├── backend/                    # Core Django project configuration
│   │   ├── celery.py               # Celery app initialization (auto 'solo' pool on Windows)
│   │   ├── settings.py             # Settings (installed apps, CORS, JWT, Celery/Redis)
│   │   ├── urls.py                 # Root URL routing
│   │   └── wsgi.py                 # WSGI entrypoint for production
│   ├── companies/                  # Company profile management
│   ├── jobs/                       # Job listings and applicant requirements
│   ├── notifications/              # In-app notifications
│   ├── recruiter_settings/         # Recruiter profile and organization settings
│   ├── users/                      # Custom User model, CandidateProfile, JWT auth
│   ├── .env.example                # Backend environment variable template
│   ├── Dockerfile                  # Python backend container build definition
│   ├── entrypoint.sh               # Container startup & migration script
│   ├── manage.py                   # Django management CLI
│   └── requirements.txt            # Python dependencies
├── frontend/                       # React 19 + Vite frontend application
│   ├── src/
│   │   ├── components/             # Reusable UI components (Dashboard, Modals, Navbar)
│   │   ├── context/                # AuthContext (JWT state & automatic refresh)
│   │   ├── pages/                  # Job board, application tracking, auth pages
│   │   └── services/               # Axios API client with request/response interceptors
│   ├── Dockerfile                  # Frontend development container
│   ├── Dockerfile.prod             # Multi-stage production container (Node -> Nginx)
│   ├── nginx.conf                  # Production reverse proxy configuration
│   └── package.json                # Frontend npm dependencies
├── docker-compose.yml              # Local development multi-container orchestration
├── docker-compose.prod.yml         # Production multi-container orchestration
├── DOCKER.md                       # Comprehensive Docker & Redis reference guide
└── README.md                       # Main project documentation
```

---

## 🚀 Getting Started (Local Development)

Follow these steps to run the platform locally on Windows (PowerShell) or macOS/Linux.

### Prerequisites

- **Python 3.11+** installed and added to `PATH`
- **Node.js 18+** & **npm** installed
- **Docker Desktop** installed and running (used to run Redis)
- **Google Gemini API Key** ([Get a free key here](https://aistudio.google.com/apikey))
- **Gmail Account with App Password** (for sending notification emails; [Google App Password Guide](https://support.google.com/accounts/answer/185833))

---

### Step 1: Clone the Repository

Open PowerShell or your terminal:

```powershell
git clone https://github.com/nileshmantati/AI-Recruitment-Platform.git
cd "AI-Recruitment-Platform"
```

---

### Step 2: Start Redis via Docker

Celery requires a running Redis message broker on port `6379`. The cleanest and recommended way to run Redis without polluting your host OS is using the project's Docker Compose service:

1. Ensure **Docker Desktop** is running.
2. From the project root, start the Redis container in the background:
   ```powershell
   docker compose up -d redis
   ```
3. Verify that the container is running and healthy:
   ```powershell
   docker exec ai_recruiter_redis redis-cli ping
   ```
   **Expected output:**
   ```text
   PONG
   ```

> 💡 *For troubleshooting existing container name collisions, port conflicts, or full Docker setups, see [DOCKER.md](DOCKER.md).*

---

### Step 3: Backend Setup (Django)

In a new PowerShell terminal:

1. **Navigate to the backend directory**:
   ```powershell
   cd "AI-Recruitment-Platform\backend"
   ```

2. **Create and activate a Python virtual environment**:
   ```powershell
   # Create virtual environment in the project root
   python -m venv ..\venv

   # Activate virtual environment on Windows PowerShell:
   ..\venv\Scripts\Activate.ps1
   ```
   *(On macOS/Linux: `source ../venv/bin/activate`)*

3. **Install dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Copy the `.env.example` file to `.env`:
   ```powershell
   cp .env.example .env
   ```
   Open `backend/.env` in your text editor and configure your credentials:
   ```env
   # Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here

   # Gmail SMTP for notifications (Use a 16-character App Password, NOT your regular password)
   EMAIL_HOST_USER=your_email@gmail.com
   EMAIL_HOST_PASSWORD=your_gmail_app_password

   # Optional overrides (defaults to local development settings if omitted)
   # REDIS_URL=redis://localhost:6379/0
   # DJANGO_SECRET_KEY=your_custom_secret_key
   ```

5. **Apply database migrations**:
   ```powershell
   python manage.py migrate
   ```

6. **Create an admin user** (Optional):
   ```powershell
   python manage.py createsuperuser
   ```

7. **Start the Django development server**:
   ```powershell
   python manage.py runserver
   ```
   The backend API will be live at `http://localhost:8000/api/`.

---

### Step 4: Start the Celery Worker

Background tasks (AI resume scoring and automated emails) run asynchronously through Celery. 

> ⚠️ **Important:** Starting the Redis container (Step 2) and starting the Celery worker process (this step) are **two separate steps**. Make sure Redis is running and responding with `PONG` before starting the worker.

Open a **separate PowerShell terminal**:

```powershell
cd "AI-Recruitment-Platform\backend"
..\venv\Scripts\Activate.ps1

# Start Celery worker with the Windows-compatible solo pool:
celery -A backend worker -l info -P solo
```

**Expected terminal output:**
```text
 -------------- celery@Your-PC v5.6.3
--- ***** ----- 
- *** --- * --- [config]
- ** ---------- .> app:         backend
- ** ---------- .> transport:   redis://localhost:6379/0
- ** ---------- .> results:     redis://localhost:6379/0
- *** --- * --- .> concurrency: 8 (solo)

[tasks]
  . ai_engine.tasks.process_resume_scoring
  . ai_engine.tasks.send_interview_invitation
  . ai_engine.tasks.send_status_update_email
  . backend.celery.debug_task

[INFO/MainProcess] Connected to redis://localhost:6379/0
[INFO/MainProcess] celery@Your-PC ready.
```

---

### Step 5: Frontend Setup (React + Vite)

Open a **third PowerShell terminal**:

1. **Navigate to the frontend directory**:
   ```powershell
   cd "AI-Recruitment-Platform\frontend"
   ```

2. **Install frontend dependencies**:
   ```powershell
   npm install
   ```

3. **Start the Vite development server**:
   ```powershell
   npm run dev
   ```
   The frontend application will be live at `http://localhost:5173`.

---

## 🌐 Application Services Summary

| Service | Access URL | Description |
|---|---|---|
| **Frontend Application** | [http://localhost:5173](http://localhost:5173) | React 19 Client SPA |
| **Backend REST API** | [http://localhost:8000/api/](http://localhost:8000/api/) | Django REST Framework endpoints |
| **Django Admin** | [http://localhost:8000/admin/](http://localhost:8000/admin/) | Database Administration Panel |
| **Redis Broker** | `localhost:6379` | Dockerized Redis queue for Celery |
| **Celery Worker** | Local Process | Background task consumer (`-P solo`) |

---

## 🔌 API Endpoints Reference

### Authentication (`/api/users/`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/users/register/` | Register candidate or recruiter | Public |
| `POST` | `/api/users/token/` | Obtain JWT access + refresh tokens | Public |
| `POST` | `/api/users/token/refresh/` | Refresh access token | Public |
| `GET` | `/api/users/me/` | Fetch authenticated user profile | Authenticated |

### Jobs (`/api/jobs/`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/jobs/` | List all active job postings with filters | Public / Auth |
| `POST` | `/api/jobs/` | Create a new job vacancy | Recruiter only |
| `GET` | `/api/jobs/my/` | List recruiter's published jobs | Recruiter only |
| `GET` | `/api/jobs/<id>/` | Retrieve job details | Public / Auth |
| `PUT/PATCH` | `/api/jobs/<id>/` | Update job posting | Job Owner only |
| `DELETE` | `/api/jobs/<id>/` | Remove job posting | Job Owner only |

### Applications (`/api/applications/`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/applications/apply/` | Submit job application with PDF resume | Candidate only |
| `GET` | `/api/applications/my/` | View candidate's application history | Candidate only |
| `GET` | `/api/applications/job/<id>/applicants/` | View applicants ranked by AI score | Recruiter only |
| `GET` | `/api/applications/<id>/generate-questions/`| Generate 4 tailored AI interview questions | Recruiter only |
| `PATCH` | `/api/applications/<id>/status/` | Update status (`SHORTLISTED` / `REJECTED`) | Recruiter only |
| `POST` | `/api/applications/<id>/schedule/` | Schedule interview + send `.ics` calendar email | Recruiter only |

### Analytics (`/api/analytics/`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/analytics/overview/` | Recruiter hiring metrics and pipeline stats | Recruiter only |

---

## ⚙️ Environment Variables Reference

Configure these in `backend/.env`:

| Variable | Required | Default / Example | Purpose |
|---|---|---|---|
| `GEMINI_API_KEY` | **Yes** | `AIzaSy...` | Authenticates with Google Gemini 2.5 Flash for resume scoring and interview questions |
| `EMAIL_HOST_USER` | **Yes** | `your_email@gmail.com` | Sender address for status notifications and calendar invites |
| `EMAIL_HOST_PASSWORD` | **Yes** | `abcd efgh ijkl mnop` | Gmail 16-character App Password |
| `REDIS_URL` | No | `redis://localhost:6379/0` | Celery broker and result backend URL (auto-configured for local Docker) |
| `DJANGO_SECRET_KEY` | No | Built-in dev secret | Django secret key (set a secure key for production) |
| `ALLOWED_HOSTS` | No | `*` | Comma-separated allowed hostnames |
| `CORS_ALLOWED_ORIGINS`| No | `http://localhost:5173,...` | Comma-separated allowed origins for frontend requests |

---

## 🔍 Troubleshooting Redis & Celery

| Symptom / Error | Root Cause | Solution |
|---|---|---|
| `Error 10061 connecting to localhost:6379. No connection could be made because the target machine actively refused it.` | Redis is stopped, or Docker Desktop is not running. | 1. Ensure Docker Desktop is running.<br>2. Run `docker compose up -d redis`<br>3. Verify with `docker exec ai_recruiter_redis redis-cli ping`. |
| `Conflict: The container name "/ai_recruiter_redis" is already in use` | An older or stopped container has the same name. | Run `docker restart ai_recruiter_redis` or remove the stale container with `docker rm -f ai_recruiter_redis` and re-run `docker compose up -d redis`. |
| `billiard.pool.SpawnPoolWorker: WinError 5 / WinError 6` on Windows | Celery default prefork pool requires POSIX `fork()`, which does not exist on Windows. | Always launch the Celery worker with the Windows `solo` execution pool: `celery -A backend worker -l info -P solo`. |
| `Task ... received` but no console output / hangs | Celery worker was not restarted after task file modifications. | Restart the Celery worker terminal (`Ctrl+C` then re-run the worker command). |

For additional Docker commands, container health checks, and production multi-container setup, refer to the [DOCKER.md](DOCKER.md) guide.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Sanja** — Built with ❤️ using Django, React & Google Gemini AI

