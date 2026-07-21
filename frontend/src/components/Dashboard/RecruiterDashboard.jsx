import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { updateApplicationStatus } from '../../services/api';
import PostJobModal from '../Modals/PostJobModal';
import AnalyticsOverview from './AnalyticsOverview';
import ScheduleInterviewModal from '../Modals/ScheduleInterviewModal';
import { MapPin, Users, ChevronRight, Briefcase, Plus } from "lucide-react";
import { T } from '../../Js/theme';

const typeStyles = {
    'Full-time': 'bg-emerald-100 text-emerald-700 ring-emerald-500/20',
    'Part-time': 'bg-amber-100 text-amber-700 ring-amber-500/20',
    'Contract': 'bg-purple-100 text-purple-700 ring-purple-500/20',
    'Remote': 'bg-sky-100 text-sky-700 ring-sky-500/20',
    'Internship': 'bg-pink-100 text-pink-700 ring-pink-500/20',
};

const RecruiterDashboard = ({ getScoreColor, getStatusBadge }) => {
    const { auth } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [applicants, setApplicants] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [statusLoading, setStatusLoading] = useState({});
    const [questionsLoading, setQuestionsLoading] = useState({});
    const [interviewQuestions, setInterviewQuestions] = useState({});

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedAppForSchedule, setSelectedAppForSchedule] = useState(null);

    useEffect(() => {
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStatusUpdate = async (applicationId, newStatus) => {
        setStatusLoading(prev => ({ ...prev, [applicationId]: newStatus }));
        try {
            await updateApplicationStatus(applicationId, newStatus);

            if (selectedJob) {
                const response = await api.get(`applications/job/${selectedJob.id}/applicants/`);
                setApplicants(response.data);
            }
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update application status.");
        } finally {
            setStatusLoading(prev => ({ ...prev, [applicationId]: null }));
        }
    };

    const handleOpenScheduleModal = (app) => {
        setSelectedAppForSchedule(app);
        setShowScheduleModal(true);
    };

    const handleGenerateQuestions = async (applicationId) => {
        setQuestionsLoading(prev => ({ ...prev, [applicationId]: true }));
        try {
            const response = await api.get(`applications/${applicationId}/generate-questions/`);
            setInterviewQuestions(prev => ({ ...prev, [applicationId]: response.data.questions }));
        } catch (err) {
            console.error("Error generating questions:", err);
            const errorMsg = err.response?.data?.error || "Failed to generate questions. Please try again.";
            alert(errorMsg);
        } finally {
            setQuestionsLoading(prev => ({ ...prev, [applicationId]: false }));
        }
    };

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await api.get('jobs/my/');
            setJobs(response.data);
            setError('');

            if (response.data.length > 0 && !selectedJob) {
                handleJobClick(response.data[0]);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load jobs.');
        } finally {
            setLoading(false);
        }
    };

    async function handleJobClick(job) {
        setSelectedJob(job);
        setApplicants([]);
        try {
            const response = await api.get(`applications/jobs/${job.id}/applicants/`);
            setApplicants(response.data);
        } catch (err) {
            console.error(err);
            setError('Could not fetch applicants.');
        }
    }

    if (loading && jobs.length === 0) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600"></div>
                    <p className="text-sm font-semibold text-slate-500">Loading your workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <main className="flex-1 pb-12">
                <div className="space-y-8 p-6 lg:p-8">
                    {/* Dashboard Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-center gap-2">
                                Good morning, {auth.username}
                                <span className="inline-block animate-bounce origin-[70%_70%]">👋</span>
                            </h2>
                            <p className="text-slate-500 font-medium">Here's what's happening with your job postings today.</p>
                        </div>
                    </div>

                    {jobs.length ? <AnalyticsOverview /> : null}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* LEFT SIDEBAR */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-6 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="text-lg! font-bold text-slate-900 tracking-tight">
                                            Active Postings
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {jobs.length} role{jobs.length !== 1 ? "s" : ""} open
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-2.5 flex-1 gap-y-3">
                                    {jobs.map((job) => {
                                        const isSelected = selectedJob?.id === job.id;
                                        return (
                                            <button
                                                key={job.id}
                                                onClick={() => handleJobClick(job)}
                                                className={`group relative w-full text-left rounded-xl! pl-4 pr-3 py-2 transition-all duration-200
                                                    ${isSelected
                                                        ? "bg-slate-700 shadow-md shadow-slate-900/10"
                                                        : "bg-slate-100 border-2 border-slate-200 hover:bg-slate-200"
                                                    }`}>
                                                {/* status rail */}
                                                <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-full transition-colors duration-200 ${isSelected ? "bg-blue-400" : "bg-slate-300 group-hover:bg-blue-400"}`} />

                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h6 className={`font-semibold truncate capitalize ${isSelected ? "text-white" : "text-slate-800"}`} > {job.title} </h6>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <span className={`flex items-center text-xs ${isSelected ? "text-slate-300" : "text-slate-500"}`} >
                                                                <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                                                                ₹{job.salary}
                                                            </span>

                                                            {job.applicants != null && (
                                                                <span className={`flex items-center text-xs ${isSelected ? "text-slate-300" : "text-slate-400"}`} >
                                                                    <Users className="w-3.5 h-3.5 mr-1 shrink-0" />
                                                                    {job.applicants}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {job.type && (
                                                            <span className={`inline-flex items-center mt-2 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${isSelected ? "bg-white/10 text-white ring-white/20" : typeStyles[job.type] ?? "bg-slate-100 text-slate-600 ring-slate-500/10"}`} > {job.type} </span>
                                                        )}
                                                    </div>

                                                    <ChevronRight className={`w-4 h-4 mt-0.5 shrink-0 transition-transform duration-200 ${isSelected ? "text-slate-400 translate-x-0.5" : "text-slate-300 group-hover:translate-x-0.5"}`} />
                                                </div>
                                            </button>
                                        );
                                    })}

                                    {jobs.length === 0 && (
                                        <div className="flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-slate-200 py-10 px-4">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                                                <Briefcase className="w-5 h-5" />
                                            </span>
                                            <p className="text-sm font-medium text-slate-600">No jobs posted yet</p>
                                            <p className="text-xs text-slate-400 mt-1 mb-4 max-w-[220px]">
                                                Post a role to start reviewing candidates.
                                            </p>
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                                                <Plus className="w-3.5 h-3.5" />
                                                Post New Job
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT CONTENT */}
                        <div className="lg:col-span-9">
                            <div className="bg-white rounded-2xl shadow p-6 h-full">
                                <h3 className="text-lg! font-bold mb-0 text-slate-900 mb-4">
                                    {selectedJob
                                        ? `Candidates for ${selectedJob.title}`
                                        : "Select a job to view candidates"}
                                </h3>

                                {error && (
                                    <div className="bg-red-100 border border-red-300 text-red-700 rounded-xl p-4 mb-5">
                                        {error}
                                    </div>
                                )}

                                {selectedJob && (
                                    <div className="grid xl:grid-cols-2 gap-4">
                                        {applicants.map((app) => (
                                            <div key={app.id} className="bg-white rounded-2xl shadow border-t-4 border-blue-600 overflow-hidden relative">

                                                {/* Match Score */}
                                                <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-sm font-semibold shadow ${getScoreColor(app.resume_score)}`}>
                                                    ⭐ {app.resume_score}% Match
                                                </span>

                                                {/* Card Body */}
                                                <div className="p-6 pb-3">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-blue-600 text-2xl mr-4">
                                                            <i className="bi bi-person-fill"></i>
                                                        </div>
                                                        <div className="break-all">
                                                            <h4 className="font-bold text-lg! mb-0 capitalize">
                                                                {app.candidate_name}
                                                            </h4>
                                                            {/* <div className="flex items-center gap-3 text-sm text-gray-500"> */}
                                                            <p className="text-sm text-gray-500 mb-1">
                                                                Applied:{" "}
                                                                {new Date(app.applied_at).toLocaleDateString()}
                                                            </p>

                                                            {getStatusBadge(app.status)}
                                                            {/* </div> */}
                                                        </div>
                                                    </div>

                                                    {app.ai_feedback && (
                                                        <div className="bg-gray-50 border rounded-xl p-4">
                                                            <h5 className="capitalize text-green-600 font-bold text-sm mb-3">
                                                                Top Strengths
                                                            </h5>
                                                            <div className="flex flex-wrap gap-2 mb-4">
                                                                {app.ai_feedback.strengths?.slice(0, 3).map((item, i) => (
                                                                    <span key={i} className="px-3 py-1 rounded-xl bg-green-100 text-green-700 border border-green-300 text-xs">
                                                                        {item}
                                                                    </span>
                                                                ))}
                                                            </div>

                                                            <h5 className="capitalize text-red-600 font-bold text-sm mb-3">
                                                                Missing Skills
                                                            </h5>
                                                            <div className="flex flex-wrap gap-2">
                                                                {app.ai_feedback.missing_skills?.slice(0, 3).map((item, i) => (
                                                                    <span key={i} className="px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-300 text-xs">
                                                                        {item}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Footer */}
                                                <div className="px-6 pb-6">
                                                    {interviewQuestions[app.id] && (
                                                        <div className="mb-4 rounded-xl border border-blue-300 bg-blue-50 p-4">
                                                            <h5 className="font-bold text-blue-600 mb-3">
                                                                🤖 AI Suggested Questions
                                                            </h5>
                                                            <ol className="list-decimal pl-5 text-sm space-y-1">
                                                                {interviewQuestions[app.id].map((q, idx) => (
                                                                    <li key={idx}>{q}</li>
                                                                ))}
                                                            </ol>
                                                        </div>
                                                    )}

                                                    {/* Buttons Row */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            onClick={() => handleGenerateQuestions(app.id)}
                                                            disabled={questionsLoading[app.id]}
                                                            className="rounded-xl! border border-blue-600 py-2 font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition">
                                                            {questionsLoading[app.id] ? "Generating..." : "⚡ AI Prep"}
                                                        </button>

                                                        <button
                                                            onClick={() => handleOpenScheduleModal(app)}
                                                            className="rounded-xl! bg-green-600 py-2 font-semibold text-white hover:bg-green-700 transition">
                                                            Schedule
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, "SHORTLISTED")}
                                                            disabled={statusLoading[app.id] || app.status === "SHORTLISTED"}
                                                            className="rounded-xl! border border-green-600 py-2 font-semibold text-green-600 hover:bg-green-600 hover:text-white transition">
                                                            {app.status === "SHORTLISTED" ? "Shortlisted" : "Shortlist"}
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                                                            disabled={statusLoading[app.id] || app.status === "REJECTED"}
                                                            className="rounded-xl! border border-red-600 py-2 font-semibold text-red-600 hover:bg-red-600 hover:text-white transition">
                                                            {app.status === "REJECTED" ? "Rejected" : "Reject"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {applicants.length === 0 && !error && (
                                            <div className="col-span-full text-center py-16">
                                                <i className="bi bi-inbox text-6xl text-gray-400"></i>
                                                <p className="mt-4 text-gray-500">
                                                    Waiting for candidates to apply...
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mount the Modal Component */}
            <PostJobModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                onJobPosted={fetchJobs}
            />
            {/* Mount the Schedule Interview Modal */}
            <ScheduleInterviewModal
                show={showScheduleModal}
                handleClose={() => {
                    setShowScheduleModal(false);
                    setSelectedAppForSchedule(null);

                    if (selectedJob) {
                        handleJobClick(selectedJob);
                    }
                }}
                application={selectedAppForSchedule}
            />
        </>
    )
}

export default RecruiterDashboard;