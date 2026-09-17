import { ArrowRight, Sparkles } from 'lucide-react';

export default function FAQQuickFlows() {
  const flows = [
    {
      id: "flow-resume",
      title: "AI Resume Analysis",
      badge: "Extraction to Insights",
      color: "border-indigo-100 bg-indigo-50/40 text-indigo-700",
      steps: [
        { label: "Resume Upload", sub: "PDF, DOCX, TXT" },
        { label: "Extraction", sub: "pdfplumber parser" },
        { label: "Gemini 2.5", sub: "JSON evaluation" },
        { label: "Insights", sub: "Score & skill gaps" },
      ],
    },
    {
      id: "flow-matching",
      title: "Candidate Matching",
      badge: "JD vs Profile",
      color: "border-purple-100 bg-purple-50/40 text-purple-700",
      steps: [
        { label: "Job Description", sub: "Recruiter requirements" },
        { label: "Candidate Profile", sub: "Parsed resume text" },
        { label: "AI Evaluation", sub: "Relevance comparison" },
        { label: "Match Score", sub: "0–100 & feedback" },
      ],
    },
    {
      id: "flow-pipeline",
      title: "Applications Pipeline",
      badge: "Async Worker",
      color: "border-emerald-100 bg-emerald-50/40 text-emerald-700",
      steps: [
        { label: "Apply Submitted", sub: "Status: PENDING" },
        { label: "Celery Worker", sub: "Background task" },
        { label: "Score Saved", sub: "Status: EVALUATED" },
        { label: "Recruiter Review", sub: "Manual shortlist" },
      ],
    },
    {
      id: "flow-interview",
      title: "Interview Scheduling",
      badge: "Email Notification",
      color: "border-sky-100 bg-sky-50/40 text-sky-700",
      steps: [
        { label: "Shortlisted", sub: "Recruiter selects" },
        { label: "Set Datetime", sub: "Date, time & link" },
        { label: "Status Updated", sub: "INTERVIEW_SCHEDULED" },
        { label: "Email Sent", sub: "Candidate invited" },
      ],
    },
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-indigo-600" />
        <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider">
          Quick-Answer Pipelines
        </h2>
        <span className="text-xs text-slate-500 hidden sm:inline">— Visual summary of how key platform workflows operate</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flows.map((f) => (
          <div
            key={f.id}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${f.color}`}>
                {f.badge}
              </span>
            </div>

            {/* 4-step pipeline bar */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {f.steps.map((step, idx) => (
                <div key={step.label} className="flex items-center relative">
                  <div className="flex-1 min-w-0 text-center">
                    <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <p className="text-[11px] font-semibold text-slate-800 truncate" title={step.label}>
                      {step.label}
                    </p>
                    <p className="text-[9px] text-slate-500 truncate" title={step.sub}>
                      {step.sub}
                    </p>
                  </div>
                  {idx < f.steps.length - 1 && (
                    <ArrowRight size={12} className="text-slate-300 absolute -right-1.5 top-2 shrink-0 z-10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
