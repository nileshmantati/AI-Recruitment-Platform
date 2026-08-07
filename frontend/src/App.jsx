// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { X } from 'lucide-react';

import Home from './pages/Home';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Footer from './components/Footer';
import JobsPage from './pages/JobsPage';
import Dashboard from './pages/Dashboard';
import NotFoundPage from './pages/NotFoundPage';

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
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/findjobs" element={<JobsPage />} />
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;