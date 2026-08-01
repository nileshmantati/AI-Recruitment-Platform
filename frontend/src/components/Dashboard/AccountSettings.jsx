import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Upload, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { motion } from 'framer-motion';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const accountSchema = yup.object().shape({
    first_name: yup.string().min(2, 'First name is required').required('First name is required'),
    last_name: yup.string().min(2, 'Last name is required').required('Last name is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    phone: yup.string().matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    position: yup.string().min(2, 'Job title is required').required('Job title is required'),
});

const formFields = [
    { name: 'first_name', label: 'First Name', type: 'text' },
    { name: 'last_name', label: 'Last Name', type: 'text' },
    { name: 'email', label: 'Email Address', type: 'email', disabled: true },
    { name: 'phone', label: 'Phone Number', type: 'text' },
    { name: 'company', label: 'Company Name', type: 'text', disabled: true },
    { name: 'position', label: 'Job Title', type: 'text' },
];

const AccountSettings = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);

    const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm({
        resolver: yupResolver(accountSchema)
    });

    const firstName = watch('first_name', '');
    const lastName = watch('last_name', '');
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'JD';


    useEffect(() => {
        fetchAccountData();
    }, []);

    const fetchAccountData = async () => {
        try {
            const response = await api.get('/settings/account/');
            reset(response.data);
            if (response.data.profile_image) {
                setProfileImage(response.data.profile_image);
            } else {
                setProfileImage(null);
            }
        } catch (error) {
            toast.error('Failed to load account settings');
        } finally {
            setIsLoading(false);
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

            await api.put('/settings/account/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            toast.success('Account updated successfully');
            await fetchAccountData();
            setProfileImageFile(null);
        } catch (error) {
            toast.error('Failed to update account');
        } finally {
            setIsSaving(false);
        }
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
            if (
                profileImage &&
                profileImage.startsWith("blob:")
            ) {
                URL.revokeObjectURL(profileImage);
            }
        };
    }, [profileImage]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <>
            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="show" className="space-y-6">

                {/* Header */}
                <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                            <User className="text-indigo-500" strokeWidth={2.5} size={28} />
                            Account Settings
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">Manage your account.</p>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white  shadow rounded-lg p-6 border border-slate-200 ">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Profile Photo */}
                        <div className="flex items-center gap-6">
                            <div className="relative h-20 w-20 rounded-full overflow-hidden bg-slate-100  border-2 border-slate-200  flex items-center justify-center">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-semibold text-slate-400">{initials}</span>
                                )}
                            </div>
                            <div>
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-slate-300  rounded-md shadow-sm text-sm font-medium text-slate-700  bg-white  hover:bg-slate-50  transition-colors">
                                    <Upload size={16} />
                                    Change Photo
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                                <p className="mt-1 text-xs text-slate-500 ">JPG, GIF or PNG. Max size of 2MB.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formFields.map((field) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-slate-700 ">
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        {...register(field.name)}
                                        disabled={field.disabled}
                                        className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border ${field.disabled
                                            ? 'bg-slate-50 text-slate-500 cursor-not-allowed'
                                            : 'bg-white text-slate-900'
                                            }`}
                                    />
                                    {errors[field.name] && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors[field.name].message}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 ">
                            <button
                                type="button"
                                onClick={() => { fetchAccountData(); setProfileImageFile(null); }}
                                disabled={(!isDirty && !profileImageFile) || isSaving}
                                className="px-4 py-2 border border-slate-300  rounded-md shadow-sm text-sm font-medium text-slate-700  bg-white  hover:bg-slate-50  disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={(!isDirty && !profileImageFile) || isSaving}
                                className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                            >
                                {isSaving && <Loader2 className="animate-spin -ml-1 mr-2" size={16} />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.main>
        </>
    );
};

export default AccountSettings;
