import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/Dashboard/DashboardSidebar.jsx';
import DashboardTopbar from '../components/Dashboard/DashboardTopbar.jsx';
import RecruiterDashboard from '../components/Dashboard/RecruiterDashboard.jsx';
import CandidateDashboard from '../components/Dashboard/CandidateDashboard.jsx';
import RecruiterProfile from '../components/Dashboard/RecruiterProfile.jsx';
import RecruiterJobsPage from '../components/Dashboard/RecruiterJobsPage.jsx';
import RecruiterApplicationsPage from '../components/Dashboard/RecruiterApplicationsPage.jsx';
import RecruiterCandidatesPage from '../components/Dashboard/RecruiterCandidatesPage.jsx';
import RecruiterResumeAIPage from '../components/Dashboard/RecruiterResumeAIPage.jsx';
import RecruiterAnalyticsPage from '../components/Dashboard/RecruiterAnalyticsPage.jsx';
import RecruiterInterviewsPage from '../components/Dashboard/RecruiterInterviewsPage.jsx';
import RecruiterCompanyProfilePage from '../components/Dashboard/RecruiterCompanyProfilePage.jsx';
import RecruiterSettingsPage from '../components/Dashboard/RecruiterSettingsPage.jsx';
import { T } from "../Js/theme.js";
import NotFoundPage from './NotFoundPage.jsx';
import CandidateProfilePage from '../components/Dashboard/CandidateProfilePage.jsx';
import CandidateApplicationsPage from '../components/Dashboard/CandidateApplicationsPage.jsx';
import CandidateSavedJobsPage from '../components/Dashboard/CandidateSavedJobsPage.jsx';
import CandidateResumeAIPage from '../components/Dashboard/CandidateResumeAIPage.jsx';
import CandidateActivityPage from '../components/Dashboard/CandidateActivityPage.jsx';
import CandidateInterviewsPage from '../components/Dashboard/CandidateInterviewsPage.jsx';
import CandidateSettingsPage from '../components/Dashboard/CandidateSettingsPage.jsx';
import JobsPage from './JobsPage.jsx';

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
    const normalizedPath = path.replace(/\/$/, '');
    let active = "Dashboard";
    if (normalizedPath === '/dashboard/company') active = "Company";
    else if (normalizedPath === '/dashboard/jobs') active = "Jobs";
    else if (normalizedPath === '/dashboard/applications') active = "Applications";
    else if (normalizedPath === '/dashboard/candidates') active = "Candidates";
    else if (normalizedPath === '/dashboard/resume-ai') active = "Resume AI";
    else if (normalizedPath === '/dashboard/analytics') active = "Analytics";
    else if (normalizedPath === '/dashboard/interview') active = "Interview";
    else if (normalizedPath === '/dashboard/interviews') active = "Interviews";
    else if (normalizedPath === '/dashboard/profile') active = "Profile";
    else if (normalizedPath === '/dashboard/saved-jobs') active = "Saved Jobs";
    else if (normalizedPath === '/dashboard/activity') active = "Activity";
    else if (normalizedPath === '/dashboard/settings') active = "Settings";
    else if (normalizedPath !== '/dashboard') active = "NotFound";

    useEffect(() => {
        if (role === 'recruiter' && !isProfileCompleted && normalizedPath !== '/dashboard/company') {
            navigate('/dashboard/company', { replace: true });
        }
    }, [role, isProfileCompleted, normalizedPath, navigate]);

    const handleSetActive = (tab) => {
        if (role === 'recruiter' && !isProfileCompleted && tab !== 'Company' && tab !== 'Settings' && tab !== 'Profile') {
            return; // Prevent navigation away from onboarding
        }
        if (tab === "Dashboard") navigate('/dashboard');
        else if (tab === "Resume AI") navigate('/dashboard/resume-ai');
        else if (tab === "Saved Jobs") navigate('/dashboard/saved-jobs');
        else if (tab === "Interviews") navigate('/dashboard/interviews');
        else if (tab === "Activity") navigate('/dashboard/activity');
        else if (tab === "Profile") navigate('/dashboard/profile');
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
        if (active === "NotFound") {
            return <NotFoundPage />;
        }

        if (role === 'recruiter') {
            if (active === "Company") return <RecruiterCompanyProfilePage isProfileCompleted={isProfileCompleted} setIsProfileCompleted={setIsProfileCompleted} />;
            if (active === "Profile") return <RecruiterProfile />;
            if (active === "Jobs") return <RecruiterJobsPage />;
            if (active === "Applications") return <RecruiterApplicationsPage />;
            if (active === "Candidates") return <RecruiterCandidatesPage />;
            if (active === "Resume AI") return <RecruiterResumeAIPage />;
            if (active === "Analytics") return <RecruiterAnalyticsPage />;
            if (active === "Interview" || active === "Interviews") return <RecruiterInterviewsPage />;
            if (active === "Settings") return <RecruiterSettingsPage />;
            return <RecruiterDashboard getScoreColor={getScoreColor} getStatusBadge={getStatusBadge} />;
        }

        // Candidate Role Routing
        if (active === "Profile") return <CandidateProfilePage />;
        if (active === "Jobs") return <JobsPage />;
        if (active === "Applications") return <CandidateApplicationsPage />;
        if (active === "Saved Jobs") return <CandidateSavedJobsPage />;
        if (active === "Resume AI") return <CandidateResumeAIPage />;
        if (active === "Activity") return <CandidateActivityPage />;
        if (active === "Interviews" || active === "Interview") return <CandidateInterviewsPage />;
        if (active === "Settings") return <CandidateSettingsPage />;

        return <CandidateDashboard getScoreColor={getScoreColor} getStatusBadge={getStatusBadge} />;
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