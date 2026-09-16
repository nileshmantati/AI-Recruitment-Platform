import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { X } from 'lucide-react';

import Navigation from './components/Navigation';
import Footer from './components/Footer';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ResumeAnalyzer = lazy(() => import('./pages/ResumeAnalyzer'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));

const PageLoader = () => (
  <div className="flex min-h-[60vh] w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
  </div>
);

const MainLayout = () => (
  <>
    <Navigation />
    <Outlet />
    <Footer />
  </>
);

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
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/findjobs" element={<JobsPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
              </Route>
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
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