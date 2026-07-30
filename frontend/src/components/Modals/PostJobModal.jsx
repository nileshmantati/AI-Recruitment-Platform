import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Briefcase } from 'lucide-react';

const PostJobModal = ({ show, handleClose, onJobPosted }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        required_skills: '',
        salary: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formattedData = {
                ...formData,
                required_skills: formData.required_skills.split(',').map(skill => skill.trim())
            };

            await api.post('jobs/', formattedData);
            toast.success("Job posted successfully!");
            onJobPosted();
            handleClose();
            setFormData({ title: '', description: '', required_skills: '', salary: '' });
        } catch (error) {
            console.error("Error posting job:", error);
            toast.error("Failed to post job. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden relative my-auto"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase className="text-blue-600" size={24} />
                                Post a New Job
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
                                Fill out the details below. Our AI will use this description to rank candidates.
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="title">Job Title</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        placeholder="e.g., Senior Django Developer"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="salary">Salary Range</label>
                                    <input
                                        type="text"
                                        id="salary"
                                        name="salary"
                                        placeholder="e.g., $100k - $120k"
                                        value={formData.salary}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="required_skills">Required Skills (comma separated)</label>
                                    <input
                                        type="text"
                                        id="required_skills"
                                        name="required_skills"
                                        placeholder="Python, Django, React"
                                        value={formData.required_skills}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="description">Detailed Job Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        placeholder="Enter job description..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-y"
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
                                        disabled={isLoading}
                                        className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2 transition-colors shadow-sm"
                                    >
                                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                                        {isLoading ? 'Posting...' : 'Publish Job'}
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

export default PostJobModal;