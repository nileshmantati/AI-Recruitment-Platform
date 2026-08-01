import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { GlassCard, TextField } from '../ui/AuthUI';
import { Building2, GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import PrimaryButton from '../components/PrimaryButton';
import { T } from '../Js/theme';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const schema = yup.object().shape({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required")
});

const Login = () => {
    const [showPass, setShowPass] = useState(false);
    const [role, setRole] = useState("recruiter");
    const navigate = useNavigate();
    const { login, auth } = useAuth();

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate('/dashboard');
        }
    }, [auth.isAuthenticated, navigate]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            username: '',
            password: ''
        }
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const onSubmit = async (data) => {
        try {
            const response = await api.post('users/login/', {
                ...data,
                role: role.toUpperCase()
            });
            login(
                response.data.access,
                response.data.refresh,
                response.data.username,
                response.data.role
            );
            toast.success('Login successful');
            navigate('/');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                toast.error(err.response.data.detail);
            } else {
                toast.error('Invalid username or password.');
            }
            console.error(err);
        }
    };

    return (
        <motion.div className="py-10 flex items-center justify-center relative overflow-hidden"
            style={{ background: `radial-gradient(1200px 600px at 50% -10%, ${T.primary}14, transparent), radial-gradient(800px 500px at 90% 10%, ${T.secondary}14, transparent)` }}>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative z-10 w-full max-w-md px-6">
                <motion.div
                    variants={itemVariants}>
                    <GlassCard className="px-8 py-4">
                        <h1 className="mb-2 text-3xl text-center font-extrabold text-slate-900">Welcome Back</h1>
                        <p className="mb-6 text-sm text-center text-slate-500">Enter your details to continue.</p>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                                {[{ id: "recruiter", label: "Recruiter", icon: Building2 }, { id: "candidate", label: "Candidate", icon: GraduationCap }].map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setRole(r.id)}
                                        className={`flex items-center justify-center gap-2 rounded-xl! py-2.5 text-sm font-semibold transition-all ${role === r.id ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                        style={role === r.id ? { color: T.primary } : {}}
                                    >
                                        <r.icon size={16} /> {r.label}
                                    </button>
                                ))}
                            </div>
                            <TextField
                                icon={Mail}
                                label="Username"
                                placeholder="you@company.com"
                                error={errors.username?.message}
                                {...register("username")}
                            />
                            <TextField
                                icon={Lock}
                                label="Password"
                                type={showPass ? "text" : "password"}
                                placeholder="••••••••"
                                rightIcon={showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                onRightClick={() => setShowPass(!showPass)}
                                error={errors.password?.message}
                                {...register("password")}
                            />
                            <div className="my-5! flex items-center justify-between text-sm">
                                <label className="flex! items-center justify-center gap-2 text-slate-600">
                                    <input type="checkbox" className="h-4! w-4! rounded! border-slate-300" style={{ accentColor: T.primary }} />
                                    <span className="text-slate-600 text-sm">Remember me</span>
                                </label>
                                <a href="#" className="font-semibold text-decoration-none" style={{ color: T.primary }}>Forgot password?</a>
                            </div>

                            <PrimaryButton type="submit" className="w-full! rounded-2xl! py-2.5! hover:scale-95 transition-all duration-300" >Log in</PrimaryButton>

                            {/* <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-200" /><span className="text-xs font-medium text-slate-400">OR</span><div className="h-px flex-1 bg-slate-200" />
                        </div>

                        <GhostButton type="button" className="w-full! rounded-2xl! py-2.5! hover:bg-slate-50">
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z" /><path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.12-1.43.34-2.09V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            Continue with Google
                        </GhostButton> */}

                            <p className="mt-4! text-center text-sm text-slate-500">
                                Don't have an account? <button type="button" onClick={() => navigate("/register")} className="font-semibold transition-opacity hover:opacity-80" style={{ color: T.primary }}>Sign up</button>
                            </p>
                        </form>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </motion.div >
    );
};

export default Login;