import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Loader2, User, Mail, Phone, Building2, Briefcase, Edit3, Save, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import { motion } from 'framer-motion';
import { T } from '../../../Js/theme';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const SectionCard = ({ title, icon: Icon, children }) => (
    <motion.div variants={fadeUp} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100" style={{ background: `${T.primary}06` }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                <Icon size={15} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">{title}</h3>
        </div>
        <div className="p-6">{children}</div>
    </motion.div>
);

const Field = ({ label, icon: Icon, disabled, error, register, name, type = 'text', placeholder }) => (
    <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        <div className={`flex items-center gap-2 rounded-xl border ${error ? 'border-red-300' : 'border-slate-200'} ${disabled ? 'bg-slate-100/70' : 'bg-slate-50'} px-3 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all`}>
            {Icon && <Icon size={14} className="shrink-0 text-slate-400" />}
            <input
                type={type}
                {...register(name)}
                disabled={disabled}
                placeholder={placeholder}
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:text-slate-500"
            />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
);

const accountSchema = yup.object().shape({
    first_name: yup.string().min(2, 'First name is required').required('First name is required'),
    last_name: yup.string().min(2, 'Last name is required').required('Last name is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    phone: yup.string().matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    position: yup.string().min(2, 'Job title is required').required('Job title is required'),
});

const RecruiterProfile = () => {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        resolver: yupResolver(accountSchema)
    });

    const firstName = watch('first_name', '');
    const lastName = watch('last_name', '');
    const email = watch('email', '');
    const phone = watch('phone', '');
    const company = watch('company', '');
    const position = watch('position', '');

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'RP';

    useEffect(() => {
        fetchAccountData();
    }, []);

    const fetchAccountData = async () => {
        try {
            const response = await api.get('/recruiter/profile/');
            reset(response.data);
            if (response.data.profile_image) {
                setProfileImage(response.data.profile_image);
            } else {
                setProfileImage(null);
            }
        } catch (error) {
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (data[key] !== null && data[key] !== undefined && key !== 'profile_image') {
                    formData.append(key, data[key]);
                }
            });

            if (profileImageFile) {
                formData.append('profile_image', profileImageFile);
            }

            await api.put('/recruiter/profile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            toast.success('Account updated successfully');
            await fetchAccountData();
            setProfileImageFile(null);
            setEditMode(false);
        } catch (error) {
            toast.error('Failed to update account');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        fetchAccountData();
        setProfileImageFile(null);
        setEditMode(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size should be less than 2MB');
                return;
            }
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
            setProfileImageFile(file);
            e.target.value = null;
        }
    };

    useEffect(() => {
        return () => {
            if (profileImage && profileImage.startsWith("blob:")) {
                URL.revokeObjectURL(profileImage);
            }
        };
    }, [profileImage]);

    if (loading) {
        return (
            <div className="flex h-[85vh] w-full items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-4 text-center p-8 max-w-sm">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                        <i className="bi bi-robot text-indigo-600 text-3xl"></i>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Fetching Profile data...</h4>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.main
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6"
        >
            {/* Header */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Recruiter Profile</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage your account information and recruiter profile</p>
                </div>
                <div className="flex gap-2">
                    {editMode ? (
                        <>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex items-center gap-2 !rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                            >
                                <X size={14} /> Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit(onSubmit)}
                                disabled={isSaving}
                                className="flex items-center gap-2 !rounded-xl px-5 py-2 text-sm font-bold text-white shadow-md transition hover:scale-95 disabled:opacity-60 cursor-pointer"
                                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-2 !rounded-xl px-5 py-2 text-sm font-bold text-white shadow-md transition hover:scale-95 cursor-pointer"
                            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                        >
                            <Edit3 size={14} /> Edit Profile
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Avatar hero */}
            <motion.div variants={fadeUp} className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${T.primary}08, ${T.accent}08)` }} />
                <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl text-white text-3xl font-extrabold shadow-lg overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            initials
                        )}
                    </div>
                    {editMode && (
                        <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition">
                            <Camera size={12} className="text-slate-500" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-extrabold text-slate-900">
                        {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Recruiter Profile'}
                    </h2>
                    <p className="text-sm text-slate-500">{position || 'Recruiter / Talent Acquisition'}</p>
                    <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-slate-500">
                        {company && <span className="flex items-center gap-1"><Building2 size={11} />{company}</span>}
                        {email && <span className="flex items-center gap-1"><Mail size={11} />{email}</span>}
                        {phone && <span className="flex items-center gap-1"><Phone size={11} />{phone}</span>}
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-1.5">
                        <span className="rounded-lg px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: `${T.primary}12`, color: T.primary }}>
                            Recruiter
                        </span>
                        <span className="rounded-lg bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                            Verified Account
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Personal Information */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <SectionCard title="Personal Information" icon={User}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field
                            label="First Name"
                            name="first_name"
                            icon={User}
                            register={register}
                            disabled={!editMode}
                            error={errors.first_name}
                            placeholder="John"
                        />
                        <Field
                            label="Last Name"
                            name="last_name"
                            icon={User}
                            register={register}
                            disabled={!editMode}
                            error={errors.last_name}
                            placeholder="Doe"
                        />
                        <Field
                            label="Email Address"
                            name="email"
                            type="email"
                            icon={Mail}
                            register={register}
                            disabled={true}
                            error={errors.email}
                            placeholder="john@example.com"
                        />
                        <Field
                            label="Phone Number"
                            name="phone"
                            icon={Phone}
                            register={register}
                            disabled={!editMode}
                            error={errors.phone}
                            placeholder="9876543210"
                        />
                        <Field
                            label="Company Name"
                            name="company"
                            icon={Building2}
                            register={register}
                            disabled={true}
                            error={errors.company}
                            placeholder="Company Inc."
                        />
                        <Field
                            label="Job Title"
                            name="position"
                            icon={Briefcase}
                            register={register}
                            disabled={!editMode}
                            error={errors.position}
                            placeholder="Senior Talent Acquisition Manager"
                        />
                    </div>
                </SectionCard>
            </form>
        </motion.main>
    )
}

export default RecruiterProfile