import { useState } from 'react';
import { scheduleInterview } from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Calendar } from 'lucide-react';

const ScheduleInterviewModal = ({ show, handleClose, application }) => {
    const [datetime, setDatetime] = useState('');
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!datetime || !link) {
            toast.error('Please provide both date/time and a meeting link.');
            return;
        }

        setLoading(true);

        try {
            await scheduleInterview(application.id, {
                interview_datetime: datetime,
                meeting_link: link
            });

            toast.success('Interview scheduled and email sent!');

            setTimeout(() => {
                handleClose();
                setDatetime('');
                setLink('');
            }, 2000);

        } catch (error) {
            toast.error(error.error || 'Failed to schedule interview.');
        } finally {
            setLoading(false);
        }
    };

    if (!application) return null;

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden relative my-auto"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Calendar className="text-blue-600" size={24} />
                                Schedule Interview
                            </h2>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-6">
                            <p className="text-slate-500 text-sm mb-6">
                                Set up an interview with <strong className="text-slate-700">{application.candidate_name || 'this candidate'}</strong>. An automated email invitation will be sent immediately.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={datetime}
                                        onChange={(e) => setDatetime(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Meeting Link (G-Meet / Zoom)</label>
                                    <input
                                        type="url"
                                        placeholder="https://meet.google.com/xyz-abcd-efg"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    />
                                </div>

                                {/* Footer buttons */}
                                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2 transition-colors shadow-sm"
                                    >
                                        {loading && <Loader2 size={16} className="animate-spin" />}
                                        {loading ? 'Sending...' : 'Send Invite'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ScheduleInterviewModal;