import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GlassCard, TextField } from '../ui/AuthUI';
import { GraduationCap, Building2, Users, Mail, Lock, Eye, EyeOff } from "lucide-react";
import PrimaryButton from '../components/PrimaryButton';
import { T } from '../Js/theme';

const Register = () => {
    const { auth } = useAuth();
    const [showPass, setShowPass] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'RECRUITER' // Default role
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    if (auth.isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {

            await api.post('users/register/', formData);

            navigate('/login');
        } catch (err) {
            console.error("Registration error:", err);

            if (err.response && err.response.data) {
                const backendErrors = Object.values(err.response.data).join(' | ');
                setError(`Registration failed: ${backendErrors}`);
            } else {

                setError('Registration failed. Network error or server is down.');
            }
        }
    };

    return (
        <div className="py-10! flex items-center justify-center relative overflow-hidden" style={{ background: `radial-gradient(1200px 600px at 50% -10%, ${T.primary}14, transparent), radial-gradient(800px 500px at 90% 10%, ${T.secondary}14, transparent)` }}>
            <div className="relative z-10 w-full max-w-md px-6">
                <GlassCard className="px-8 py-4">
                    <h1 className="mb-2 text-3xl text-center font-extrabold text-slate-900">Create Account</h1>

                    {error && (
                        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600 border border-red-100">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='mt-3'>
                        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                            {[{ id: "RECRUITER", label: "Recruiter", icon: Building2 }, { id: "CANDIDATE", label: "Candidate", icon: GraduationCap }].map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: r.id })}
                                    className={`flex items-center justify-center gap-2 rounded-xl! py-2.5 text-sm font-semibold transition-all ${formData.role === r.id ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    style={formData.role === r.id ? { color: T.primary } : {}}
                                >
                                    <r.icon size={16} /> {r.label}
                                </button>
                            ))}
                        </div>

                        <TextField
                            icon={Users}
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Alex Morgan"
                        />
                        <TextField
                            icon={Mail}
                            label="Email address"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@company.com"
                        />
                        <TextField
                            icon={Lock}
                            label="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            type={showPass ? "text" : "password"}
                            placeholder="Create a password"
                            rightIcon={showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            onRightClick={() => setShowPass(!showPass)}
                        />

                        <PrimaryButton type="submit" className="w-full! rounded-2xl! my-3 py-2.5!" >Sign Up</PrimaryButton>

                        <p className="mt-6 text-center text-sm text-slate-500">
                            Already have an account? <button type="button" onClick={() => navigate("/login")} className="font-semibold transition-opacity hover:opacity-80" style={{ color: T.primary }}>Log in</button>
                        </p>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
};

export default Register;