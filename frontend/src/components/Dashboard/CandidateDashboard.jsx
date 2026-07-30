import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CandidateDashboard = ({ getScoreColor, getStatusBadge }) => {
    const { auth } = useAuth();
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyApplications = async () => {
        try {
            const response = await api.get('applications/my/');
            setMyApplications(response.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load your applications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMyApplications();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center mt-20">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <main className="flex-1 bg-slate-50 min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <h3 className="font-bold text-2xl text-slate-900 mb-4">My Dashboard</h3>

                <div className="bg-white border-0 shadow-sm rounded-2xl p-6 mb-6">
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-100 rounded-full p-4 mr-4 flex items-center justify-center">
                            <i className="bi bi-person-fill text-blue-600 text-2xl"></i>
                        </div>
                        <div>
                            <h5 className="font-bold text-lg text-slate-900 mb-0">Welcome, {auth.username}!</h5>
                            <span className="text-slate-500 text-sm">Candidate Account</span>
                        </div>
                    </div>
                    <p className="text-slate-600">
                        Browse open positions on the <Link to="/findjobs" className="text-blue-600 hover:underline">Job Board</Link> and apply with your resume.
                        Our AI will automatically score and rank your application.
                    </p>
                </div>

                <h5 className="font-bold text-xl text-slate-900 mb-4">My Applications</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myApplications.map((app) => (
                        <div key={app.id} className="bg-white h-full shadow-sm border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-bold text-slate-900 mb-0">{app.job_details?.title}</h5>
                                    {getStatusBadge(app.status)}
                                </div>
                                <p className="text-slate-500 text-sm mb-2">
                                    {app.job_details?.salary || 'Salary Undisclosed'}
                                </p>
                                <p className="text-slate-500 text-sm mb-4">
                                    Applied: {new Date(app.applied_at).toLocaleDateString()}
                                </p>

                                {app.resume_score > 0 && (
                                    <div className="mb-4">
                                        <span
                                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-${getScoreColor(app.resume_score)}-100 text-${getScoreColor(app.resume_score)}-700`}
                                        >
                                            <i className="bi bi-stars mr-1.5"></i>{app.resume_score}% Match
                                        </span>
                                    </div>
                                )}

                                {app.ai_feedback && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <strong className="block text-emerald-600 text-xs uppercase font-bold tracking-wider mb-2">
                                            <i className="bi bi-check-circle-fill mr-1.5"></i>Strengths
                                        </strong>
                                        <div className="mb-3 flex flex-wrap gap-1.5">
                                            {app.ai_feedback.strengths?.slice(0, 3).map((s, i) => (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200" key={i}>
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                        <strong className="block text-rose-600 text-xs uppercase font-bold tracking-wider mb-2">
                                            <i className="bi bi-exclamation-circle-fill mr-1.5"></i>To Improve
                                        </strong>
                                        <div className="flex flex-wrap gap-1.5">
                                            {app.ai_feedback.missing_skills?.slice(0, 3).map((s, i) => (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200" key={i}>
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {myApplications.length === 0 && (
                        <div className="col-span-full text-center py-16">
                            <i className="bi bi-briefcase text-slate-300 text-6xl"></i>
                            <p className="text-slate-500 mt-4">You haven't applied to any jobs yet. Visit the <Link to="/findjobs" className="text-blue-600 hover:underline">Job Board</Link> to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

export default CandidateDashboard