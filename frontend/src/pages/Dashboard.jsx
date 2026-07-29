import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/Dashboard/DashboardSidebar.jsx';
import DashboardTopbar from '../components/Dashboard/DashboardTopbar.jsx';
import RecruiterDashboard from '../components/Dashboard/RecruiterDashboard.jsx';
import CandidateDashboard from '../components/Dashboard/CandidateDashboard.jsx';
import RecruiterJobsPage from '../components/Dashboard/RecruiterJobsPage.jsx';
import RecruiterApplicationsPage from '../components/Dashboard/RecruiterApplicationsPage.jsx';
import RecruiterCandidatesPage from '../components/Dashboard/RecruiterCandidatesPage.jsx';
import RecruiterResumeAIPage from '../components/Dashboard/RecruiterResumeAIPage.jsx';
import RecruiterAnalyticsPage from '../components/Dashboard/RecruiterAnalyticsPage.jsx';
import RecruiterInterviewsPage from '../components/Dashboard/RecruiterInterviewsPage.jsx';
import RecruiterCompanyProfilePage from '../components/Dashboard/RecruiterCompanyProfilePage.jsx';
import { T } from "../Js/theme.js";

const Dashboard = () => {
    const { auth } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [role] = useState(auth.role.toLowerCase());

    // Onboarding state for recruiters
    const [isProfileCompleted, setIsProfileCompleted] = useState(() => {
        return localStorage.getItem('profile_completed') === 'true';
    });

    const path = location.pathname;
    let active = "Dashboard";
    if (path.includes('/company-profile')) active = "Company Profile";
    else if (path.includes('/jobs')) active = "Jobs";
    else if (path.includes('/applications')) active = "Applications";
    else if (path.includes('/candidates')) active = "Candidates";
    else if (path.includes('/resume-ai')) active = "Resume AI";
    else if (path.includes('/analytics')) active = "Analytics";
    else if (path.includes('/interview')) active = "Interview";
    else if (path.includes('/settings')) active = "Settings";

    useEffect(() => {
        if (role === 'recruiter' && !isProfileCompleted && !path.includes('/company-profile')) {
            navigate('/dashboard/company-profile', { replace: true });
        }
    }, [role, isProfileCompleted, path, navigate]);

    const handleSetActive = (tab) => {
        if (role === 'recruiter' && !isProfileCompleted) {
            return; // Prevent navigation away from onboarding
        }
        if (tab === "Dashboard") navigate('/dashboard');
        else if (tab === "Resume AI") navigate('/dashboard/resume-ai');
        else navigate(`/dashboard/${tab.toLowerCase().replace(" ", "-")}`);
    };

    const getScoreColor = (score) => {
        if (score >= 85)
            return "bg-green-100 text-green-700 border border-green-300";

        if (score >= 65)
            return "bg-yellow-100 text-yellow-700 border border-yellow-300";

        return "bg-red-100 text-red-700 border border-red-300";
    };

    const getStatusBadge = (status) => {
        const map = {
            PENDING: {
                label: "Pending",
                className: "bg-yellow-100 text-yellow-700 border-yellow-300",
            },
            EVALUATED: {
                label: "AI Evaluated",
                className: "bg-cyan-100 text-cyan-700 border-cyan-300",
            },
            SHORTLISTED: {
                label: "Shortlisted",
                className: "bg-green-100 text-green-700 border-green-300",
            },
            REJECTED: {
                label: "Rejected",
                className: "bg-red-100 text-red-700 border-red-300",
            },
            INTERVIEW_SCHEDULED: {
                label: "Interview Scheduled",
                className: "bg-blue-100 text-blue-700 border-blue-300",
            },
            ERROR: {
                label: "Error",
                className: "bg-gray-900 text-white border-gray-900",
            },
        };

        const info = map[status] || {
            label: status,
            className: "bg-gray-100 text-gray-700 border-gray-300",
        };

        return (
            <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${info.className}`}
            >
                {info.label}
            </span>
        );
    };

    const renderContent = () => {
        if (active === "Company Profile" && role === 'recruiter') {
            return <RecruiterCompanyProfilePage
                isProfileCompleted={isProfileCompleted}
                setIsProfileCompleted={setIsProfileCompleted}
            />;
        }
        if (active === "Jobs" && role === 'recruiter') {
            return <RecruiterJobsPage />;
        }
        if (active === "Applications" && role === 'recruiter') {
            return <RecruiterApplicationsPage />;
        }
        if (active === "Candidates" && role === 'recruiter') {
            return <RecruiterCandidatesPage />;
        }
        if (active === "Resume AI" && role === 'recruiter') {
            return <RecruiterResumeAIPage />;
        }
        if (active === "Analytics" && role === 'recruiter') {
            return <RecruiterAnalyticsPage />;
        }
        if (active === "Interview" && role === 'recruiter') {
            return <RecruiterInterviewsPage />;
        }
        if (role !== 'recruiter') {
            return <CandidateDashboard getScoreColor={getScoreColor} getStatusBadge={getStatusBadge} />;
        }
        return <RecruiterDashboard getScoreColor={getScoreColor} getStatusBadge={getStatusBadge} />;
    };

    return (
        <section className="flex h-screen w-full overflow-hidden" style={{ background: T.bg }}>
            <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} active={active} setActive={handleSetActive} role={role} />

            <div className="flex-1 overflow-y-auto">
                <DashboardTopbar role={role} />
                {renderContent()}
            </div>
        </section >
    );
};

export default Dashboard;