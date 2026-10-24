# 🐳 Docker & Redis Guide: AI Recruitment Platform

This document serves as the primary technical reference for managing Docker containers, the Redis message broker, and background Celery task execution in the AI Recruitment Platform.

---

## 📋 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Prerequisites & Docker Verification](#-prerequisites--docker-verification)
3. [Local Development: Running Redis in Docker (Recommended)](#-local-development-running-redis-in-docker-recommended)
4. [Connecting Django & Celery to Redis](#-connecting-django--celery-to-redis)
5. [Starting the Celery Worker](#-starting-the-celery-worker)
6. [Container Lifecycle & Safe Cleanup](#-container-lifecycle--safe-cleanup)
7. [Full-Stack Docker Compose Workflows](#-full-stack-docker-compose-workflows)
8. [Resolving Conflicts & Troubleshooting](#-resolving-conflicts--troubleshooting)

---

## 🏗️ Architecture Overview

The platform uses **Redis 7 (Alpine)** as an in-memory message broker and result backend for **Celery 5.6**, processing asynchronous operations such as:
- Google Gemini AI resume scoring (`ai_engine.tasks.process_resume_scoring`)
- Automated candidate status update emails (`ai_engine.tasks.send_status_update_email`)
- Interview invitations with `.ics` calendar generation (`ai_engine.tasks.send_interview_invitation`)

```
┌─────────────────────────────────┐         ┌───────────────────────────────┐
│       Django Web Server         │         │        React Frontend         │
│     (Local / Port 8000)         │         │     (Local / Port 5173)       │
└────────────────┬────────────────┘         └───────────────────────────────┘
                 │ dispatches task (.delay())
                 ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                     Docker Engine (Port 6379)                             │
│       ┌───────────────────────────────────────────────────────────┐       │
│       │        Container: ai_recruiter_redis (redis:7-alpine)      │       │
│       └───────────────────────────────────────────────────────────┘       │
└────────────────┬──────────────────────────────────────────────────────────┘
                 │ consumes task
                 ▼
┌─────────────────────────────────┐
│      Celery Background Worker   │
│     (Local / Windows -P solo)   │
└─────────────────────────────────┘
```

---

## 🔍 Prerequisites & Docker Verification

Before starting containers, verify that Docker Desktop and the Docker CLI are active on your Windows machine:

### 1. Check Docker CLI and Compose Versions
Open PowerShell:
```powershell
docker --version
docker compose version
```

### 2. Verify Docker Daemon is Running
```powershell
docker ps
```
- **If Docker is running**: It returns a list of active containers (such as your existing `mysql56-container` on port 3306).
- **If Docker is stopped**: It prints an error:
  `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`
  *Fix:* Launch the **Docker Desktop** application from your Windows Start menu and wait until the status indicator turns green ("Engine running").

---

## 🚀 Local Development: Running Redis in Docker (Recommended)

When running Django (`python manage.py runserver`) and Vite (`npm run dev`) directly on your Windows host, you only need Docker to run the **Redis** service.

The project configuration in [docker-compose.yml](docker-compose.yml) defines the standard Redis service:

```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: ai_recruiter_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
```

### Step 1: Start Redis
Run from the project root (`AI-Recruitment-Platform`):
```powershell
docker compose up -d redis
```

### Step 2: Verify Container Health
Check active containers:
```powershell
docker ps
```
You should see `ai_recruiter_redis` with `Status: Up ... (healthy)` and port mapping `0.0.0.0:6379->6379/tcp`.

### Step 3: Test Redis Connectivity
Send a ping to Redis directly inside the container:
```powershell
docker exec ai_recruiter_redis redis-cli ping
```
**Expected Successful Output:**
```text
PONG
```

You can also test the port connection from Python on your Windows host:
```powershell
python -c "import redis; print('Redis Ping:', redis.Redis(host='localhost', port=6379).ping())"
```
**Expected Output:** `Redis Ping: True`

---

## 🔌 Connecting Django & Celery to Redis

### Environment Variable: `REDIS_URL`

In [backend/backend/settings.py](backend/backend/settings.py):
```python
CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
```

- **Local Windows Development (Host to Container)**:
  Docker maps container port `6379` to your Windows host `0.0.0.0:6379`. Therefore, Django and Celery connect seamlessly to:
  ```text
  redis://localhost:6379/0
  ```
  *(This is the default fallback; no extra `.env` configuration is needed).*

- **Full-Stack Containerized Development (Inside Docker Network)**:
  When backend and celery run inside Docker containers, they communicate across the internal Docker bridge network via service DNS:
  ```text
  redis://redis:6379/0
  ```
  *(Automatically passed via `docker-compose.yml`).*

- **Production / Cloud Broker**:
  Override with your managed Redis URL (e.g. AWS ElastiCache, Upstash, or Redis Cloud) in `backend/.env`:
  ```env
  REDIS_URL=rediss://default:your_secure_password@your-redis-host.com:6380/0
  ```

---

## ⚡ Starting the Celery Worker

> ⚠️ **Important:** Starting the Redis container and running the Celery worker are **two independent steps**:
> 1. Redis is the *message queue* (runs in Docker on port 6379).
> 2. Celery is the *worker process* (runs in Python, pulls jobs from Redis).

Once `docker exec ai_recruiter_redis redis-cli ping` returns `PONG`:

1. Open a new PowerShell terminal.
2. Navigate to the `backend` folder:
   ```powershell
   cd "AI-Recruitment-Platform\backend"
   ..\venv\Scripts\Activate.ps1
   ```
3. Start the worker using the Windows-compatible `solo` execution pool:
   ```powershell
   celery -A backend worker -l info -P solo
   ```

**Expected Startup Log:**
```text
 -------------- celery@Your-Desktop v5.6.3
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
[INFO/MainProcess] celery@Your-Desktop ready.
```

---

## 🔄 Container Lifecycle & Safe Cleanup

Understanding the difference between stopping, restarting, and deleting containers protects your database and queue state.

### Starting and Stopping Services

| Action | PowerShell Command | Explanation |
|---|---|---|
| **Start Redis** | `docker compose up -d redis` | Creates/starts Redis in background |
| **Stop Redis (Safe)** | `docker compose stop redis` | Pauses Redis container without deleting data |
| **Restart Redis** | `docker compose restart redis` | Restarts the container process |
| **Inspect Redis** | `docker inspect ai_recruiter_redis` | Views container configuration, network & health |
| **Live Logs** | `docker logs -f ai_recruiter_redis` | Streams real-time Redis server logs |

### Safe Cleanup (Stopping vs. Deleting)

- **Stop containers without removing them**:
  ```powershell
  docker compose stop
  ```
  *(Preserves container state and networks).*

- **Remove containers and networks safely**:
  ```powershell
  docker compose down
  ```
  *(Stops and deletes the containers, but **keeps** Docker volumes like `media_data`).*

- **⚠️ Delete containers AND persistent volumes**:
  ```powershell
  docker compose down -v
  ```
  *(Only use this if you want a complete factory reset. This deletes media uploads and database volumes).*

---

## 🌐 Full-Stack Docker Compose Workflows

If you prefer to run the entire stack (Frontend, Backend, Celery, Redis) inside Docker containers rather than running Django and React natively:

### Development Mode (Hot-Reloading)
Mounts source code into containers with hot-reloading for both React (Vite) and Django:
```powershell
docker compose up --build
```
- **Frontend SPA**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000/api/](http://localhost:8000/api/)
- **Django Admin**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

To run migrations inside the backend container:
```powershell
docker compose exec backend python manage.py migrate
```

To create a superuser inside the container:
```powershell
docker compose exec backend python manage.py createsuperuser
```

### Production Mode (Nginx + Gunicorn)
For VPS, AWS, or production deployments using [docker-compose.prod.yml](docker-compose.prod.yml):
```powershell
docker compose -f docker-compose.prod.yml up --build -d
```
- **Frontend**: Served via Nginx on port `80` with asset caching and gzip compression.
- **Backend**: Managed by Gunicorn WSGI workers behind Nginx reverse proxy (`/api/` and `/admin/`).
- **Celery & Redis**: Production containers running with `restart: always`.

---

## 🛠️ Resolving Conflicts & Troubleshooting

### 1. Connection Refused: `Error 10061 connecting to localhost:6379`
- **Cause**: Redis container is stopped, or Docker Desktop is not running.
- **Resolution**:
  1. Check if Docker is running: `docker ps`.
  2. If Docker Desktop is stopped, start it.
  3. Start the Redis service: `docker compose up -d redis`.
  4. Verify with `docker exec ai_recruiter_redis redis-cli ping`.

---

### 2. Name Conflict: `The container name "/ai_recruiter_redis" is already in use`
- **Cause**: A stopped container with the same name exists from a previous run.
- **Resolution**:
  ```powershell
  # Check all containers including stopped ones:
  docker ps -a
  
  # Remove the stale container:
  docker rm -f ai_recruiter_redis
  
  # Re-launch Redis:
  docker compose up -d redis
  ```

---

### 3. Port Conflict: `Bind for 0.0.0.0:6379 failed: port is already allocated`
- **Cause**: Another service or an older container (such as an old `redis-broker` or native Redis instance) is already using port `6379`.
- **Resolution**:
  1. Find what container is using port 6379:
     ```powershell
     docker ps -a --filter "publish=6379"
     ```
  2. If an old container (e.g. `redis-broker`) is holding the port, stop and remove it:
     ```powershell
     docker stop redis-broker
     docker rm redis-broker
     ```
  3. If your MySQL container (`mysql56-container` on port `3306`) is running, it will **not** conflict because Redis uses port `6379`.
  4. Launch the project's official Redis container:
     ```powershell
     docker compose up -d redis
     ```

---

### 4. Windows Celery Multiprocessing Error (`WinError 5` / `WinError 6`)
- **Cause**: On Windows, Python lacks POSIX `fork()`. Running Celery with the default prefork pool crashes `billiard.pool.SpawnPoolWorker`.
- **Resolution**: Always supply `-P solo` when launching Celery on Windows:
  ```powershell
  celery -A backend worker -l info -P solo
  ```
  *(The project's [backend/backend/celery.py](backend/backend/celery.py) also includes automatic fallback to `solo` on Windows).*

---

### Related Documentation
- Return to [README.md](README.md) for local development setup, prerequisites, and API documentation.

