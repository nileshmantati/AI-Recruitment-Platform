import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/Dashboard/DashboardSidebar.jsx';
import DashboardTopbar from '../components/Dashboard/DashboardTopbar.jsx';
import RecruiterDashboard from '../components/Dashboard/RecruiterDashboard.jsx';
import CandidateDashboard from '../components/Dashboard/CandidateDashboard.jsx';
import { T } from "../Js/theme.js";

const Dashboard = () => {
    const { auth } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("Dashboard");
    const [role, setRole] = useState(auth.role.toLowerCase());

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

    return (
        <section className="flex h-screen w-full overflow-hidden" style={{ background: T.bg }}>
            <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} active={active} setActive={setActive} role={role} />

            <div className="flex-1 overflow-y-auto">
                <DashboardTopbar role={role} />
                {role != 'recruiter' ?
                    <CandidateDashboard getScoreColor={getScoreColor} getStatusBadge={getStatusBadge} />
                    : <RecruiterDashboard getScoreColor={getScoreColor} getStatusBadge={getStatusBadge} />}
            </div>
        </section >
    );
};

export default Dashboard;