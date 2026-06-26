# 🤖 AI Recruitment Platform

An intelligent, full-stack recruitment platform that leverages **Google Gemini AI** to automate resume screening, candidate ranking, and interview preparation — streamlining the hiring pipeline for recruiters.

![Django](https://img.shields.io/badge/Django-6.0-green?logo=django)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-orange?logo=google)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)

---

## ✨ Key Features

### 🧠 AI-Powered Engine (Google Gemini)
- **Smart Resume Scoring** — AI evaluates resumes against job descriptions and returns a 0–100 match score
- **Strength & Gap Analysis** — Identifies candidate strengths, weaknesses, and missing skills
- **AI Interview Prep** — Generates 4 tailored interview questions per candidate based on their profile

### 👔 Recruiter Dashboard
- Post and manage job listings
- View AI-ranked candidates sorted by match score
- One-click Shortlist / Reject with automated email notifications
- Schedule interviews with calendar integration and email invitations
- Real-time analytics with charts (applications per job, shortlist rates)

### 👤 Candidate Portal
- Browse active job listings
- Apply with PDF resume upload
- Track application status and view AI feedback (scores, strengths, gaps)

### 🔐 Authentication & Security
- JWT-based authentication (access + refresh tokens)
- Role-based access control (Recruiter / Candidate)
- Protected API endpoints with ownership verification
- Auto token refresh on expiration

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, React Bootstrap, Recharts |
| **Backend** | Django 6.0, Django REST Framework |
| **AI Engine** | Google Gemini 2.5 Flash (`google-generativeai`) |
| **Auth** | JWT via `djangorestframework-simplejwt` |
| **Task Queue** | Celery + Redis (for background email processing) |
| **Database** | SQLite (development) |
| **Email** | Gmail SMTP with App Passwords |

---

## 📁 Project Structure

```
AI-Recruitment-Platform/
├── ai_engine/              # Gemini AI services (resume scoring, question generation)
│   ├── services.py         # Core AI functions (evaluate_candidate_resume, generate_interview_questions)
│   └── tasks.py            # Celery tasks for background processing
├── applications/           # Job application management
│   ├── models.py           # Application model (score, feedback, status)
│   ├── views.py            # Apply, list, status update, interview scheduling APIs
│   └── urls.py             # Application endpoints
├── jobs/                   # Job posting management
│   ├── models.py           # Job model
│   └── views.py            # CRUD operations for jobs
├── users/                  # User authentication & profiles
│   ├── models.py           # Custom User model + CandidateProfile
│   ├── signals.py          # Auto-create CandidateProfile on registration
│   └── views.py            # Register, Login (JWT), Current User
├── analytics/              # Recruiter analytics dashboard
│   └── views.py            # Aggregated stats + chart data
├── backend/                # Django project settings
│   ├── settings.py         # Main configuration
│   ├── urls.py             # Root URL routing
│   └── celery.py           # Celery app configuration
├── frontend/               # React + Vite SPA
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Dashboard, JobBoard, Login, Register
│       ├── context/        # Auth context (React Context API)
│       └── services/       # Axios API client with JWT interceptors
├── .env.example            # Environment variable template
├── requirements.txt        # Python dependencies
└── manage.py               # Django management script
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Redis Server (for Celery task queue)
- Google Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/AI-Recruitment-Platform.git
cd AI-Recruitment-Platform
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your actual API keys and credentials

# Run migrations
python manage.py migrate

# Create superuser (optional, for admin access)
python manage.py createsuperuser

# Start the Django server
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Start Celery Worker (for background emails)
```bash
# In a new terminal, from the project root:
celery -A backend worker -l INFO
```

### 5. Access the Application
| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register/` | Register new user |
| POST | `/api/users/token/` | Login (get JWT tokens) |
| POST | `/api/users/token/refresh/` | Refresh access token |
| GET | `/api/users/me/` | Get current user details |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/jobs/` | List all active jobs |
| POST | `/api/jobs/` | Create new job (Recruiter only) |
| GET | `/api/jobs/my/` | List recruiter's own jobs |
| GET/PUT/DELETE | `/api/jobs/<id>/` | Job detail operations |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/applications/apply/` | Apply for a job (with resume) |
| GET | `/api/applications/my/` | Candidate's applications |
| GET | `/api/applications/job/<id>/applicants/` | Job's applicants (Recruiter) |
| GET | `/api/applications/<id>/generate-questions/` | AI interview questions |
| PATCH | `/api/applications/<id>/status/` | Update status (Shortlist/Reject) |
| POST | `/api/applications/<id>/schedule/` | Schedule interview |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/overview/` | Recruiter dashboard stats |

---

## ⚙️ Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for AI features |
| `EMAIL_HOST_USER` | Gmail address for sending notifications |
| `EMAIL_HOST_PASSWORD` | Gmail App Password (not your real password) |
| `DJANGO_SECRET_KEY` | Django secret key (optional, has default for dev) |

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
