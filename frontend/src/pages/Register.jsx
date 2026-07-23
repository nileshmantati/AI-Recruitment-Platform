import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GlassCard, TextField } from '../ui/AuthUI';
import { GraduationCap, Building2, Users, Mail, Lock, Eye, EyeOff } from "lucide-react";
import PrimaryButton from '../components/PrimaryButton';
import { T } from '../Js/theme';
import toast from 'react-hot-toast';

const schema = yup.object().shape({
    username: yup.string().required("Username is required").min(3, "Username must be at least 3 characters"),
    email: yup.string().required("Email is required").email("Invalid email format"),
    password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
    role: yup.string().required("Role is required")
});

const Register = () => {
    const { auth } = useAuth();
    const [showPass, setShowPass] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            role: 'RECRUITER' // Default role
        }
    });

    const currentRole = watch("role");
    const navigate = useNavigate();

    if (auth.isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const onSubmit = async (data) => {
        try {
            await api.post('users/register/', data);
            toast.success('Registration successful! Please log in.');
            navigate('/login');
        } catch (err) {
            console.error("Registration error:", err);

            if (err.response && err.response.data) {
                const backendErrors = Object.values(err.response.data).join(' | ');
                toast.error(`Registration failed: ${backendErrors}`);
            } else {
                toast.error('Registration failed. Network error or server is down.');
            }
        }
    };

    return (
        <div className="py-10! flex items-center justify-center relative overflow-hidden" style={{ background: `radial-gradient(1200px 600px at 50% -10%, ${T.primary}14, transparent), radial-gradient(800px 500px at 90% 10%, ${T.secondary}14, transparent)` }}>
            <div className="relative z-10 w-full max-w-md px-6">
                <GlassCard className="px-8 py-4">
                    <h1 className="mb-2 text-3xl text-center font-extrabold text-slate-900">Create Account</h1>

                    <form onSubmit={handleSubmit(onSubmit)} className='mt-3'>
                        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                            {[{ id: "RECRUITER", label: "Recruiter", icon: Building2 }, { id: "CANDIDATE", label: "Candidate", icon: GraduationCap }].map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setValue("role", r.id)}
                                    className={`flex items-center justify-center gap-2 rounded-xl! py-2.5 text-sm font-semibold transition-all ${currentRole === r.id ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                    style={currentRole === r.id ? { color: T.primary } : {}}
                                >
                                    <r.icon size={16} /> {r.label}
                                </button>
                            ))}
                        </div>

                        <TextField
                            icon={Users}
                            label="Username"
                            placeholder="Alex Morgan"
                            error={errors.username?.message}
                            {...register("username")}
                        />
                        <TextField
                            icon={Mail}
                            label="Email address"
                            placeholder="you@company.com"
                            error={errors.email?.message}
                            {...register("email")}
                        />
                        <TextField
                            icon={Lock}
                            label="Password"
                            type={showPass ? "text" : "password"}
                            placeholder="Create a password"
                            rightIcon={showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            onRightClick={() => setShowPass(!showPass)}
                            error={errors.password?.message}
                            {...register("password")}
                        />

                        <PrimaryButton type="submit" className="w-full! rounded-2xl! my-3 py-2.5! hover:scale-95 transition-all duration-300" >Sign Up</PrimaryButton>

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