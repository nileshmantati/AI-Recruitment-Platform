import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/Admin/AdminProtectedRoute';

import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { X } from 'lucide-react';

import Navigation from './components/Navigation';
import Footer from './components/Footer';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ResumeAnalyzer = lazy(() => import('./pages/ResumeAnalyzer'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));

// Admin Dashboard Components
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/Admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/Admin/AdminUsersPage'));
const AdminJobsPage = lazy(() => import('./pages/Admin/AdminJobsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/Admin/AdminAnalyticsPage'));

const PageLoader = () => (
  <div className="flex min-h-[90vh] w-full flex-col items-center justify-center gap-2">
    <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
    <p className="text-lg text-slate-600">Loading...</p>
  </div>
);

const MainLayout = () => (
  <>
    <Navigation />
    <Outlet />
    <Footer />
  </>
);

const AdminIndexRedirect = () => {
  const { auth, hasPermission } = useAuth();
  if (auth.isSuperuser || hasPermission('dashboard.view')) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (hasPermission('jobs.view')) {
    return <Navigate to="/admin/jobs" replace />;
  }
  if (hasPermission('users.view')) {
    return <Navigate to="/admin/users" replace />;
  }
  if (hasPermission('analytics.view')) {
    return <Navigate to="/admin/analytics" replace />;
  }
  return <Navigate to="/admin/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            success: {
              style: {
                background: '#10B981', // Emerald green
                color: 'white',
                fontWeight: '500',
              },
              iconTheme: {
                primary: 'white',
                secondary: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444', // Red
                color: 'white',
                fontWeight: '500',
              },
              iconTheme: {
                primary: 'white',
                secondary: '#EF4444',
              },
            },
            style: {
              background: '#334155', // Default dark slate
              color: 'white',
            }
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <>
                  {icon}
                  {message}
                  {t.type !== 'loading' && (
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="ml-2 rounded p-1 hover:bg-black/10 transition-colors"
                      aria-label="Close"
                    >
                      <X size={16} className="text-current opacity-70" />
                    </button>
                  )}
                </>
              )}
            </ToastBar>
          )}
        </Toaster>
        <div className="bg-slate-50 min-h-screen">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Pages with Main Navigation and Footer */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/findjobs" element={<JobsPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
              </Route>

              {/* Candidate & Recruiter Dashboard (Protected) */}
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {/* Secure Admin Portal (Protected, Dual-Tier RBAC) */}
              <Route path="/admin" element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }>
                <Route index element={<AdminIndexRedirect />} />
                <Route path="dashboard" element={
                  <AdminProtectedRoute requiredPermission="dashboard.view">
                    <AdminDashboardPage />
                  </AdminProtectedRoute>
                } />
                <Route path="users" element={
                  <AdminProtectedRoute requiredPermission="users.view">
                    <AdminUsersPage />
                  </AdminProtectedRoute>
                } />
                <Route path="jobs" element={
                  <AdminProtectedRoute requiredPermission="jobs.view">
                    <AdminJobsPage />
                  </AdminProtectedRoute>
                } />
                <Route path="analytics" element={
                  <AdminProtectedRoute requiredPermission="analytics.view">
                    <AdminAnalyticsPage />
                  </AdminProtectedRoute>
                } />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* 404 Fallback */}
              <Route element={<MainLayout />}>
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;