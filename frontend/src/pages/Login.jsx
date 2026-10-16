import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { GlassCard, TextField } from '../ui/AuthUI';
import { Building2, GraduationCap, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import PrimaryButton from '../components/PrimaryButton';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';
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
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [unverifiedAccount, setUnverifiedAccount] = useState(null);
    const navigate = useNavigate();
    const { login, auth } = useAuth();

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate('/dashboard');
        }
    }, [auth.isAuthenticated, navigate]);

    const { register, handleSubmit, setValue, getValues, formState: { errors, isSubmitting } } = useForm({
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
        setUnverifiedAccount(null);
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
            if (err.response?.data?.code === 'email_not_verified') {
                const unverifiedEmail = err.response.data.email || '';
                const unverifiedUsername = err.response.data.username || data.username;
                setUnverifiedAccount({ email: unverifiedEmail, username: unverifiedUsername });
                toast.error('Your email address is not verified. Please verify your email.');
                return;
            }

            const errorMsg =
                err.response?.data?.detail ||
                (Array.isArray(err.response?.data?.non_field_errors) && err.response.data.non_field_errors[0]) ||
                err.response?.data?.message ||
                'Invalid username or password.';
            toast.error(errorMsg);
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

                        {unverifiedAccount && (
                            <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-200 p-3.5 flex items-start gap-3 shadow-sm">
                                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-950 flex-1">
                                    <p className="font-extrabold text-amber-900">Email Not Verified</p>
                                    <p className="mt-0.5 text-amber-800 leading-relaxed font-medium">
                                        Your account is registered but your email address requires verification.
                                    </p>
                                    <div className="mt-2.5 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/verify-email', {
                                                state: {
                                                    email: unverifiedAccount.email,
                                                    username: unverifiedAccount.username
                                                }
                                            })}
                                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
                                        >
                                            Verify Email Now &rarr;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                                {[{ id: "recruiter", label: "Recruiter", icon: Building2 }, { id: "candidate", label: "Candidate", icon: GraduationCap }].map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setRole(r.id)}
                                        className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all cursor-pointer ${role === r.id ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                        style={role === r.id ? { color: T.primary } : {}}
                                    >
                                        <r.icon size={16} /> {r.label}
                                    </button>
                                ))}
                            </div>
                            <TextField
                                icon={Mail}
                                label="Username"
                                placeholder="Enter Username"
                                error={errors.username?.message}
                                {...register("username")}
                            />
                            <TextField
                                icon={Lock}
                                label="Password"
                                type={showPass ? "text" : "password"}
                                placeholder="••••••••"
                                rightIcon={showPass ? <EyeOff size={16} className='cursor-pointer' /> : <Eye size={16} className='cursor-pointer' />}
                                onRightClick={() => setShowPass(!showPass)}
                                error={errors.password?.message}
                                {...register("password")}
                            />
                            <div className="my-5 flex items-center justify-between text-sm">
                                <label className="flex items-center justify-center gap-2 text-slate-600">
                                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 cursor-pointer" style={{ accentColor: T.primary }} />
                                    <span className="text-slate-600 text-sm">Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="font-semibold text-sm hover:underline cursor-pointer bg-transparent border-0 p-0 transition-opacity hover:opacity-80"
                                    style={{ color: T.primary }}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <PrimaryButton type="submit" disabled={isSubmitting} className="w-full rounded-2xl py-2.5 hover:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:hover:scale-100" >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Logging in...
                                    </>
                                ) : (
                                    "Log in"
                                )}
                            </PrimaryButton>

                            <p className="mt-4 text-center text-sm text-slate-500">
                                Don't have an account? <button type="button" onClick={() => navigate("/register")} className="font-semibold transition-opacity hover:opacity-80" style={{ color: T.primary }}>Sign up</button>
                            </p>
                        </form>
                    </GlassCard>
                </motion.div>
            </motion.div>

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
                defaultIdentifier={getValues('username') || ''}
                onResetSuccess={(username) => {
                    if (username) setValue('username', username);
                    setValue('password', '');
                }}
            />
        </motion.div >
    );
};

export default Login;