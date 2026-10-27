import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/Admin/AdminSidebar';
import AdminTopbar from '../components/Admin/AdminTopbar';
import { T } from '../Js/theme';

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden" style={{ background: T.bg }}>
            {/* Admin Sidebar */}
            <AdminSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                isMobileOpen={isMobileOpen}
                closeMobileMenu={() => setIsMobileOpen(false)}
            />

            {/* Main Area */}
            <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                <AdminTopbar toggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)} />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
