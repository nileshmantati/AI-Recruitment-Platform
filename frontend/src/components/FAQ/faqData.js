// Curated single source of truth for medium-length FAQ content
// Strictly grounded in active Django models, views, and services.

export const FAQ_CATEGORIES = [
  "All",
  "AI & Matching",
  "Recruiters & Pipeline",
  "Candidates",
  "Security & Access",
];

export const FAQ_ITEMS = [
  // ── 1. AI & Matching ──
  {
    id: "ai-1",
    category: "AI & Matching",
    role: "all",
    question: "How does AI resume analysis work in this platform?",
    answer:
      "When a resume is uploaded, the platform parses text from PDF, DOCX, or TXT formats and passes it to Google Gemini 2.5 Flash. The model generates an overall quality score (0–100), extracts owned skills, identifies missing skill gaps, highlights strengths and weaknesses, and produces targeted improvement advice.",
    icon: "Brain",
    optionalVisual: {
      title: "AI Resume Analysis Pipeline",
      steps: [
        { step: "1", title: "Upload", desc: "PDF, DOCX, or TXT" },
        { step: "2", title: "Extraction", desc: "pdfplumber & docx parser" },
        { step: "3", title: "Gemini 2.5", desc: "Structured prompt schema" },
        { step: "4", title: "Insights", desc: "Score, skills & gap analysis" },
      ],
    },
  },
  {
    id: "ai-2",
    category: "AI & Matching",
    role: "all",
    isAIBoundary: true,
    question: "Does the AI make the final hiring or rejection decision?",
    answer:
      "No. The AI functions strictly as a decision-support assistant. It scores resumes, identifies skill matches, and flags gaps, but all shortlisting, interview invitations, job offers, and rejections are made manually by human recruiters.",
    icon: "ShieldCheck",
    optionalVisual: {
      title: "Decision Boundary",
      steps: [
        { step: "1", title: "AI Analysis", desc: "Extracts & benchmarks data" },
        { step: "2", title: "Recruiter Review", desc: "Human inspects profile" },
        { step: "3", title: "Manual Action", desc: "Shortlist, interview, or reject" },
      ],
    },
  },
  {
    id: "ai-3",
    category: "AI & Matching",
    role: "all",
    question: "What do the AI scores and match percentages represent?",
    answer:
      "The platform provides two score contexts: 1) In the standalone Resume Analyzer, the score reflects general resume presentation and industry clarity. 2) In job applications, the score specifically benchmarks candidate qualifications against the recruiter's exact job description and required skills.",
    icon: "Target",
  },

  // ── 2. Recruiters & Pipeline ──
  {
    id: "rec-1",
    category: "Recruiters & Pipeline",
    role: "recruiter",
    question: "How do recruiters manage jobs and review candidate rankings?",
    answer:
      "Recruiters post listings with custom descriptions, salary, and skill tags. Inside the recruiter dashboard, applicants are automatically ranked by their AI resume score (highest first), enabling teams to immediately prioritize top-matching profiles.",
    icon: "BriefcaseBusiness",
  },
  {
    id: "rec-2",
    category: "Recruiters & Pipeline",
    role: "recruiter",
    question: "What are the exact status stages in the hiring pipeline?",
    answer:
      "The backend tracks 6 database-backed statuses: PENDING (received), EVALUATED (AI scoring complete), SHORTLISTED (recruiter advanced candidate), INTERVIEW_SCHEDULED (meeting date & link sent), REJECTED (declined with email update), and ERROR (file extraction issue).",
    icon: "ClipboardList",
    optionalVisual: {
      title: "Pipeline Status Flow",
      steps: [
        { step: "1", title: "PENDING", desc: "Application received" },
        { step: "2", title: "EVALUATED", desc: "AI scores resume" },
        { step: "3", title: "SHORTLISTED", desc: "Recruiter advances" },
        { step: "4", title: "INTERVIEW", desc: "Meeting scheduled" },
      ],
    },
  },
  {
    id: "rec-3",
    category: "Recruiters & Pipeline",
    role: "recruiter",
    question: "How does AI question generation assist during candidate interviews?",
    answer:
      "Recruiters can generate tailored interview questions for any applicant. Gemini 2.5 Flash analyzes the job description alongside the candidate's evaluated strengths and weaknesses to generate 4 targeted interview questions (2 validating strengths and 2 probing skill gaps).",
    icon: "Lightbulb",
  },

  // ── 3. Candidates ──
  {
    id: "can-1",
    category: "Candidates",
    role: "candidate",
    question: "Can candidates track their application progress and view AI feedback?",
    answer:
      "Yes. Inside Candidate Dashboard -> Applications, applicants see real-time status badges, their match score, and transparent feedback highlighting recognized strengths and identified missing skills.",
    icon: "UserCheck",
  },
  {
    id: "can-2",
    category: "Candidates",
    role: "candidate",
    question: "How do candidates apply for open roles?",
    answer:
      "Candidates browse active openings on the Find Jobs page, view required skills, and apply using their saved profile resume or by uploading a fresh PDF. The platform prevents duplicate submissions for the same position.",
    icon: "FileText",
  },
  {
    id: "can-3",
    category: "Candidates",
    role: "candidate",
    question: "Can candidates test their resume before applying?",
    answer:
      "Yes. The standalone Resume Analyzer allows anyone to upload a PDF, DOCX, or TXT resume to receive instant feedback, score breakdowns, and recommendations without submitting to a specific job.",
    icon: "Brain",
  },

  // ── 4. Security & Access ──
  {
    id: "sec-1",
    category: "Security & Access",
    role: "all",
    question: "How are recruiter and candidate accounts separated?",
    answer:
      "Role-based access control is enforced at both API and router levels. Candidates access job browsing and personal application tracking, while recruiters access job posting, applicant management, company profile setup, and analytics. Protected routes redirect unauthenticated users to login.",
    icon: "LockKeyhole",
  },
  {
    id: "sec-2",
    category: "Security & Access",
    role: "all",
    question: "Can candidates view recruiter data or other applicants' submissions?",
    answer:
      "No. Database queries are strictly scoped by user identity. Candidates can only see their own application data. Recruiters can only access applicants who applied to jobs created by their account.",
    icon: "ShieldCheck",
  },
  {
    id: "sec-3",
    category: "Security & Access",
    role: "all",
    question: "What happens if resume processing encounters a file error?",
    answer:
      "If a file is corrupted, unreadable, or missing text, Celery background tasks retry up to 3 times before setting the status to 'ERROR'. An error badge is displayed, and the candidate is prompted to upload a clear PDF or DOCX file.",
    icon: "FileText",
  },
];
