import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/Dashboard/DashboardSidebar';
import DashboardTopbar from '../components/Dashboard/DashboardTopbar';
import { useAuth } from '../context/AuthContext';
import { T } from '../Js/theme';

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { auth } = useAuth();
    const role = auth?.role ? auth.role.toLowerCase() : 'admin';

    return (
        <section className="flex h-screen w-full overflow-hidden" style={{ background: T.bg }}>
            {/* Dashboard Sidebar */}
            <DashboardSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                role={role}
            />

            {/* Main Area */}
            <div className="flex-1 min-w-0 overflow-y-auto">
                <DashboardTopbar role={role} />

                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </section>
    );
};

export default AdminLayout;
