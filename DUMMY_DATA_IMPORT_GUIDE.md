# AI Recruitment Platform: Production Dummy Data Import Guide
**Neon PostgreSQL & Django Safe Seeding Documentation**

---

## 1. Executive Summary & Project Audit

This guide provides complete, production-safe instructions to populate the deployed AI Recruitment Platform with realistic dummy companies and jobs.

### Key Architectural Findings from Project Audit:
1. **Target Database**:
   - **Local Environment**: SQLite (`backend/db.sqlite3`).
   - **Production Environment**: Neon PostgreSQL via `DATABASE_URL` configured in `backend/backend/settings.py` (`dj_database_url` with SSL required).
2. **Models & Field Specifications**:
   - **`Company` (`companies.models.Company`)**:
     - `user`: `OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='company')` (**UNIQUE, NOT NULL**).
     - Required fields: `name`, `industry`, `user_id`.
     - Optional fields: `tagline`, `size`, `founded_year`, `website`, `email`, `phone`, `about`, `mission`, `vision`, `why_join_us`, `country`, `state`, `city`, `address`, `postal_code`, `google_map_link`, `working_mode`, `working_days`, `working_hours`, `benefits`, `perks`, `languages`, `dress_code`, `is_verified`.
     - `working_mode` choices: `('REMOTE', 'Remote')`, `('HYBRID', 'Hybrid')`, `('ONSITE', 'Onsite')`.
   - **`Job` (`jobs.models.Job`)**:
     - `recruiter`: `ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posted_jobs')` (**NOT NULL**).
     - `title`: `CharField(max_length=255)`.
     - `description`: `TextField()` (rich HTML supported by frontend parser).
     - `required_skills`: `JSONField(default=list)` (array of skill strings).
     - `salary`: `CharField(max_length=100)`.
     - `type`: `CharField(max_length=50, default='Full-time')` (values: `'Full-time'`, `'Part-time'`, `'Contract'`, `'Internship'`, `'Remote'`).
     - `is_active`: `BooleanField(default=True)`.
     - `created_at`: `DateTimeField(auto_now_add=True)`.
3. **Foreign Key Relationship & Model Dependency**:
   - In Django, `Job` does **not** possess a direct `company_id` foreign key. Instead, jobs are owned by a `recruiter` (`User`).
   - The platform resolves company names dynamically:
     ```python
     # jobs/serializers.py (JobSerializer.get_company)
     if hasattr(obj.recruiter, 'company') and obj.recruiter.company and obj.recruiter.company.name:
         return obj.recruiter.company.name
     if hasattr(obj.recruiter, 'recruiter_profile') and obj.recruiter.recruiter_profile and obj.recruiter.recruiter_profile.company:
         return obj.recruiter.recruiter_profile.company
     return obj.recruiter.username
     ```
   - In the frontend (`JobsPage.jsx`), jobs display `Posted by {job.company || job.recruiter_name}` and parse rich HTML descriptions containing complete company background, role responsibilities, qualifications, and employment terms.

---

## 2. Production Database Safety Invariants

This dataset and import tooling were built to operate strictly within production safety constraints:

1. **Zero Deletions**: No SQL `DROP`, `DELETE`, `TRUNCATE`, or `ALTER` statements are ever executed.
2. **No Database Flushes**: Never calls `flush`, `migrate --run-syncdb`, or reset commands.
3. **No Fake User Generation**: Strictly enforces **never** creating fake user, recruiter, candidate, or admin accounts to satisfy foreign-key constraints.
4. **Existing Data Preserved**: Real user accounts, candidate resumes, applications, and existing companies are untouched.
5. **Full Idempotency**: Running the import multiple times will detect existing records and skip them safely without creating duplicates.
6. **Atomic Transactions**: All operations execute within `transaction.atomic()`. Any runtime error triggers an automatic rollback.
7. **Dry-Run Validation**: Full `--dry-run` flag allows testing without committing any database writes.
8. **No Hardcoded Credentials**: Database connections rely entirely on Django settings and the runtime `DATABASE_URL` environment variable.

---

## 3. Deliverables & File Manifest

| File | Location | Purpose |
| :--- | :--- | :--- |
| `dummy_companies.json` | `backend/dummy_companies.json` | 9 fictional Indian tech companies across AI, FinTech, HealthTech, E-commerce, EdTech, IT Services, DevTools, Digital Marketing, and Cyber Defense. |
| `dummy_jobs.json` | `backend/dummy_jobs.json` | Exactly 20 realistic tech jobs mapped to the generated companies with complete descriptions, skills, and salaries. |
| `seed_dummy_jobs.py` (Command) | `backend/jobs/management/commands/seed_dummy_jobs.py` | Native Django management command (`python manage.py seed_dummy_jobs`). |
| `seed_dummy_jobs.py` (Script) | `backend/seed_dummy_jobs.py` | Standalone CLI script runner (`python seed_dummy_jobs.py`). |
| `DUMMY_DATA_IMPORT_GUIDE.md` | `DUMMY_DATA_IMPORT_GUIDE.md` | Step-by-step production execution and verification guide. |

---

## 4. Generated Companies (9 Industries)

All 9 companies represent fictional, realistic Indian technology enterprises:

| # | Company Name | Industry | Headquarters | Size | Working Mode |
| :- | :--- | :--- | :--- | :--- | :--- |
| 1 | **CogniPulse AI Labs** | Artificial Intelligence | Bengaluru, Karnataka | 50-100 | Hybrid |
| 2 | **VelocePay Technologies** | FinTech | Mumbai, Maharashtra | 200-500 | Hybrid |
| 3 | **ArogyaSync HealthTech** | Healthcare Technology | Hyderabad, Telangana | 100-250 | Onsite |
| 4 | **ZippoMart Retail Systems** | E-commerce | Gurugram, Haryana | 500-1000 | Hybrid |
| 5 | **VidyaSphere Learning** | EdTech | Pune, Maharashtra | 50-150 | Remote |
| 6 | **InfraNova Global Solutions** | IT Services | Chennai, Tamil Nadu | 1000+ | Hybrid |
| 7 | **StackForge Systems** | Software Development | Bengaluru, Karnataka | 50-150 | Remote |
| 8 | **AdNexus Growth Labs** | Digital Marketing | Noida, Uttar Pradesh | 30-80 | Hybrid |
| 9 | **KavachNet Defense Technologies** | Cybersecurity | Bengaluru, Karnataka | 80-200 | Onsite |

---

## 5. Summary of Exactly 20 Dummy Jobs

| # | Job Title | Company | Type | Experience Level | Salary Range | Location |
| :- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Python Developer** | CogniPulse AI Labs | Full-time | Entry-level (1-2 yrs) | ₹6.5L - ₹9.5L PA | Bengaluru (Hybrid) |
| 2 | **Django Backend Developer** | StackForge Systems | Full-time | Experienced (3-5 yrs) | ₹12L - ₹18L PA | Bengaluru / Remote |
| 3 | **React.js Developer** | VelocePay Technologies | Full-time | Mid-level (2-4 yrs) | ₹9L - ₹14L PA | Mumbai (Hybrid) |
| 4 | **Full Stack Developer** | ZippoMart Retail Systems | Full-time | Experienced (4-6 yrs) | ₹15L - ₹22L PA | Gurugram (Hybrid) |
| 5 | **MERN Stack Developer** | VidyaSphere Learning | Full-time | Entry-to-Mid (1-3 yrs) | ₹7L - ₹11L PA | Pune / Remote |
| 6 | **AI/ML Engineer** | CogniPulse AI Labs | Full-time | Experienced (3-6 yrs) | ₹18L - ₹28L PA | Bengaluru (Hybrid) |
| 7 | **Data Analyst** | AdNexus Growth Labs | Full-time | Fresher / Entry (0-2 yrs) | ₹4.5L - ₹7L PA | Noida (Hybrid) |
| 8 | **Frontend Developer** | ArogyaSync HealthTech | Internship | Internship (0-1 yr) | ₹25K - ₹35K / mo | Hyderabad (Onsite) |
| 9 | **Software Engineer** | InfraNova Global Solutions | Full-time | Experienced (2-4 yrs) | ₹8.5L - ₹13.5L PA | Chennai (Hybrid) |
| 10 | **DevOps Engineer** | StackForge Systems | Full-time | Experienced (3-6 yrs) | ₹14L - ₹22L PA | Bengaluru (Hybrid) |
| 11 | **Java Developer** | VelocePay Technologies | Full-time | Mid-to-Senior (3-6 yrs) | ₹13L - ₹19L PA | Mumbai (Hybrid) |
| 12 | **UI/UX Designer** | VidyaSphere Learning | Full-time | Mid-level (2-4 yrs) | ₹8L - ₹13L PA | Pune / Remote |
| 13 | **QA Engineer** | ArogyaSync HealthTech | Full-time | Entry-level (1-3 yrs) | ₹5.5L - ₹8.5L PA | Hyderabad (Onsite) |
| 14 | **Data Scientist** | ZippoMart Retail Systems | Full-time | Experienced (4-7 yrs) | ₹17L - ₹26L PA | Gurugram (Hybrid) |
| 15 | **Cloud Engineer** | InfraNova Global Solutions | Full-time | Mid-to-Senior (3-5 yrs) | ₹11L - ₹17L PA | Chennai (Hybrid) |
| 16 | **Node.js Developer** | AdNexus Growth Labs | Full-time | Mid-level (2-4 yrs) | ₹9.5L - ₹15L PA | Noida (Hybrid) |
| 17 | **Android Developer** | ArogyaSync HealthTech | Internship | Internship / Fresher (0-1 yr)| ₹22K - ₹30K / mo | Hyderabad (Onsite) |
| 18 | **Cybersecurity Analyst**| KavachNet Defense Technologies| Full-time | Experienced (3-6 yrs) | ₹14L - ₹21L PA | Bengaluru (Onsite) |
| 19 | **Business Analyst** | VelocePay Technologies | Full-time | Mid-level (2-4 yrs) | ₹8.5L - ₹13.5L PA | Mumbai (Hybrid) |
| 20 | **Technical Support Engineer**| InfraNova Global Solutions | Full-time | Fresher / Entry (0-2 yrs) | ₹4L - ₹6.5L PA | Chennai (Hybrid) |

---

## 6. How the 1:1 Recruiter / Company Dependency is Handled

### The Dependency:
`Company.user` is a `OneToOneField(settings.AUTH_USER_MODEL)`.
In PostgreSQL, this creates a `UNIQUE NOT NULL` constraint on `companies_company.user_id`.
Consequently:
- Two companies cannot share the same `user_id`.
- A company cannot be inserted with `user_id = NULL`.
- If production has only 1 recruiter account, only 1 company can be attached to that user.

### The Safe Production Solution:
1. **Zero Fake Users**: The script will **never** generate fake recruiters or candidates.
2. **Recruiter Linking**:
   - The script audits the database and links new companies to available, unattached recruiters.
   - If there are fewer unattached recruiters than companies, the remaining companies are preserved in `dummy_companies.json` without failing or corrupting the database.
3. **Job Attribution**:
   - All 20 jobs are created and attributed to the designated recruiter (e.g. `--recruiter-username=<username>` or your primary recruiter/superuser).
   - In the frontend and API, each job's complete company identity is preserved in `dummy_jobs.json` and in the rich HTML description headers (`<h3>About [Company Name]</h3>`).
   - If you later create more real recruiter accounts in production, simply re-run the script to link the remaining companies!

---

## 7. Step-by-Step Instructions to Import into Neon PostgreSQL

You have two convenient ways to run the import:

### Option A: From Local Terminal (Connecting Directly to Neon)

If you have your production Neon PostgreSQL connection string:

1. Open PowerShell / Command Prompt and navigate to the `backend` folder:
   ```powershell
   cd "backend"
   ```

2. Temporarily set the `DATABASE_URL` environment variable to your Neon connection string:
   ```powershell
   # PowerShell
   $env:DATABASE_URL = "postgresql://<username>:<password>@<neon-hostname>/<dbname>?sslmode=require"

   # Bash / Linux / macOS
   export DATABASE_URL="postgresql://<username>:<password>@<neon-hostname>/<dbname>?sslmode=require"
   ```

3. **Step 1: Run Pre-Flight Dry Run (Safe Test)**:
   ```bash
   python manage.py seed_dummy_jobs --dry-run
   ```
   *Verify the output summary. It will show what would be created without altering the database.*

4. **Step 2: Execute Real Import**:
   ```bash
   python manage.py seed_dummy_jobs
   ```
   *(Optional) To assign all jobs to a specific recruiter username:*
   ```bash
   python manage.py seed_dummy_jobs --recruiter-username="nilesh"
   ```

5. **Step 3: Remove the local environment variable**:
   ```powershell
   $env:DATABASE_URL = ""
   ```

---

### Option B: From Deployed Cloud Console (Render / Heroku / AWS)

If your Django backend is deployed on Render or another cloud host:

1. Open the **Shell** or **SSH Console** on your deployed backend service (e.g., in Render dashboard: Service -> **Shell**).
2. Run the dry-run test:
   ```bash
   python manage.py seed_dummy_jobs --dry-run
   ```
3. Run the live import:
   ```bash
   python manage.py seed_dummy_jobs
   ```

---

## 8. CLI Command Arguments Reference

| Flag | Type | Description |
| :--- | :--- | :--- |
| `--dry-run` | Flag | Simulates the import and rolls back all database transactions. |
| `--recruiter-username=<user>` | String | Explicitly assigns jobs to the specified recruiter's username. |
| `--recruiter-id=<id>` | Integer| Explicitly assigns jobs to the specified user ID. |
| `--allow-admin-users` | Flag | Permits admin/staff accounts to be linked to companies if no recruiters are unattached. |
| `--skip-companies` | Flag | Skips company insertion and only inserts jobs. |
| `--skip-jobs` | Flag | Skips job insertion and only inserts companies. |
| `--companies-file=<path>` | String | Custom file path to `dummy_companies.json`. |
| `--jobs-file=<path>` | String | Custom file path to `dummy_jobs.json`. |

---

## 9. Verification Instructions

After importing, verify the records using any of the following methods:

### Method 1: Django Admin Portal
1. Navigate to your Django Admin URL: `https://<your-backend-domain>/admin/`
2. Log in with your Superadmin account.
3. Check **Jobs** -> **Jobs**:
   - Verify that **20 jobs** are listed.
   - Verify job titles, required skills, and types.
4. Check **Companies** -> **Companies**:
   - Verify inserted company profiles and details.

### Method 2: Direct SQL Query (DataGrip / pgAdmin / DBeaver / Neon Console)
Open a SQL query editor in DataGrip or Neon Console and run these read-only queries:

```sql
-- 1. Check total job count and types
SELECT type, COUNT(*) AS count
FROM jobs_job
GROUP BY type
ORDER BY count DESC;

-- 2. Inspect all 20 jobs with title, salary, and recruiter ID
SELECT id, title, salary, type, recruiter_id, created_at, is_active
FROM jobs_job
ORDER BY id DESC
LIMIT 20;

-- 3. Check companies table
SELECT id, name, industry, city, state, is_verified, user_id
FROM companies_company
ORDER BY id DESC;

-- 4. Verify no jobs have missing recruiters (FK integrity check)
SELECT j.id, j.title, u.username, u.role
FROM jobs_job j
LEFT JOIN users_user u ON j.recruiter_id = u.id
WHERE u.id IS NULL;
-- (Should return 0 rows)
```

### Method 3: Candidate Web Portal
1. Open the frontend website: `https://ai-recruitment-platform-fawn.vercel.app/jobs`
2. Search for any newly imported role (e.g. `Python Developer`, `Cybersecurity Analyst`, `AI/ML Engineer`).
3. Click on a job card to view the full modal details and confirm the rich company overview and responsibilities.
