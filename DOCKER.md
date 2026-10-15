# 🐳 Docker Guide: AI Recruitment Platform

This project is fully containerized and ready to run with Docker and Docker Compose. It orchestrates 4 services:
1. **Frontend**: React 19 + Vite (Dev mode on port `5173`) or Nginx SPA (Prod mode on port `80`)
2. **Backend**: Django 6 REST API (running on port `8000`)
3. **Celery Worker**: Asynchronous task runner for AI resume scoring and status emails
4. **Redis**: In-memory broker for Celery tasks (running on port `6379`)

---

## 🚀 Quick Start (Development Mode)

Development mode mounts your source code inside the containers with live hot-reloading for both React and Django.

### 1. Configure Environment Variables
Ensure your `backend/.env` file exists with your keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_gmail_app_password
```

### 2. Build & Launch Containers
```bash
docker compose up --build
```

### 3. Access the Application
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000/api/](http://localhost:8000/api/)
- **Django Admin**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

## 🌐 Production Mode (Nginx + Gunicorn)

For production deployment (e.g. AWS, DigitalOcean, VPS, GCP):

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

- **Frontend**: [http://localhost](http://localhost) (Port 80 served via Nginx with gzip compression & asset caching)
- **Backend API**: Routed through Nginx `/api/` reverse proxy to Gunicorn WSGI workers

---

## 🛠️ Common Useful Commands

### Stop Containers
```bash
docker compose down
```

### Run Django Migrations Inside Container
*(Migrations run automatically on container startup via `entrypoint.sh`, but you can also run them manually)*
```bash
docker compose exec backend python manage.py migrate
```

### Create a Superuser
```bash
docker compose exec backend python manage.py createsuperuser
```

### View Live Logs
```bash
# All services
docker compose logs -f

# Specific service (e.g. celery worker or backend)
docker compose logs -f celery
docker compose logs -f backend
```

### Restart a Single Service
```bash
docker compose restart backend
docker compose restart celery
```

### Clean Up Containers & Volumes
```bash
docker compose down -v
```

---

## 📁 Docker Structure

```
├── docker-compose.yml          # Development orchestration with hot-reloading
├── docker-compose.prod.yml     # Production orchestration (Nginx + Gunicorn)
├── .dockerignore               # Root ignore rules
├── backend/
│   ├── Dockerfile              # Python 3.12 slim image
│   ├── entrypoint.sh           # Auto-migration & startup script
│   ├── .dockerignore           # Backend-specific ignore rules
│   └── requirements.txt        # Python dependencies (UTF-8 encoded)
└── frontend/
    ├── Dockerfile              # Vite Node.js dev container
    ├── Dockerfile.prod         # Multi-stage production build (Node -> Nginx)
    ├── nginx.conf              # Production Nginx reverse-proxy config
    └── .dockerignore           # Frontend-specific ignore rules
```
