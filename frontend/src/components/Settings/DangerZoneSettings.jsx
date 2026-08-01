import { useState } from 'react';
import { AlertTriangle, Trash2, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DangerZoneSettings = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isDeactivating, setIsDeactivating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteType, setDeleteType] = useState(''); // 'account' or 'company'
    const [confirmText, setConfirmText] = useState('');

    const handleDeactivate = async () => {
        setIsDeactivating(true);
        try {
            await api.delete('/settings/account/', { data: { action: 'DEACTIVATE' } });
            toast.success('Account deactivated');
            logout();
            navigate('/login');
        } catch { toast.error('Failed to deactivate account');
        } finally {
            setIsDeactivating(false);
        }
    };

    const handleDelete = async () => {
        if (confirmText !== 'DELETE') {
            toast.error('Please type DELETE to confirm');
            return;
        }

        setIsDeleting(true);
        try {
            if (deleteType === 'account') {
                await api.delete('/settings/account/', { data: { action: 'DELETE' } });
                toast.success('Account deleted successfully');
                logout();
                navigate('/');
            } else if (deleteType === 'company') {
                // Implementation for company deletion
                toast.success('Company deleted successfully');
                navigate('/dashboard/company');
            }
            setDeleteModalOpen(false);
        } catch {(`Failed to delete ${deleteType}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const openDeleteModal = (type) => {
        setDeleteType(type);
        setConfirmText('');
        setDeleteModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-red-600  flex items-center gap-2">
                    <AlertTriangle size={20} /> Danger Zone
                </h3>
                <p className="mt-1 text-sm text-slate-500 ">
                    Irreversible and destructive actions for your account and company.
                </p>
            </div>

            <div className="border border-red-200  rounded-lg overflow-hidden">
                <div className="bg-red-50  p-6 space-y-6">

                    {/* Deactivate Account */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-red-200 ">
                        <div>
                            <h4 className="text-base font-medium text-slate-900 ">Deactivate Account</h4>
                            <p className="text-sm text-slate-500  mt-1 max-w-lg">
                                Hide your profile and suspend your access. You can reactivate by logging in later.
                            </p>
                        </div>
                        <button
                            onClick={handleDeactivate}
                            disabled={isDeactivating}
                            className="inline-flex justify-center items-center px-4 py-2 border border-red-300  rounded-md shadow-sm text-sm font-medium text-red-700  bg-white  hover:bg-red-50  disabled:opacity-50 transition-colors"
                        >
                            {isDeactivating && <Loader2 className="animate-spin -ml-1 mr-2" size={16} />}
                            Deactivate
                        </button>
                    </div>

                    {/* Delete Account */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-red-200 ">
                        <div>
                            <h4 className="text-base font-medium text-slate-900 ">Delete Account</h4>
                            <p className="text-sm text-slate-500  mt-1 max-w-lg">
                                Permanently remove your personal account and all associated data. This action cannot be undone.
                            </p>
                        </div>
                        <button
                            onClick={() => openDeleteModal('account')}
                            className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                        >
                            Delete Account
                        </button>
                    </div>

                    {/* Delete Company */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-base font-medium text-slate-900 ">Delete Company</h4>
                            <p className="text-sm text-slate-500  mt-1 max-w-lg">
                                Permanently delete the company workspace, including all jobs, candidates, and team members.
                            </p>
                        </div>
                        <button
                            onClick={() => openDeleteModal('company')}
                            className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                        >
                            Delete Company
                        </button>
                    </div>

                </div>
            </div>

            {/* Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white  rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 ">
                            <h3 className="text-lg font-semibold text-slate-900  flex items-center gap-2">
                                <AlertTriangle className="text-red-500" size={20} />
                                Confirm Deletion
                            </h3>
                            <button onClick={() => setDeleteModalOpen(false)} className="text-slate-400 hover:text-slate-600 ">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600  mb-4">
                                You are about to permanently delete your <strong className="text-slate-900 ">{deleteType}</strong>. This action is irreversible. All associated data will be permanently removed.
                            </p>
                            <label className="block text-sm font-medium text-slate-700  mb-2">
                                Please type <span className="text-red-600 font-bold select-all">DELETE</span> to confirm.
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className="block w-full rounded-md border-slate-300  bg-white  px-3 py-2 border shadow-sm sm:text-sm text-slate-900  focus:border-red-500 focus:ring-red-500"
                                placeholder="DELETE"
                            />
                        </div>
                        <div className="px-6 py-4 bg-slate-50  flex justify-end gap-3 rounded-b-lg border-t border-slate-200 ">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 border border-slate-300  rounded-md text-sm font-medium text-slate-700  bg-white  hover:bg-slate-50 "
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={confirmText !== 'DELETE' || isDeleting}
                                className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Trash2 className="mr-2" size={16} />}
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DangerZoneSettings;
