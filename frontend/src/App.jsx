// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Footer from './components/Footer';
import JobsPage from './pages/JobsPage';
import Dashboard from './pages/Dashboard';

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
        <div className="bg-light min-vh-100">
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;