import { useState, useRef } from 'react';
import api from '../../services/api';
import { T } from '../../Js/theme';
import { X, UploadCloud, FileText, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ApplyJobModal = ({ show, handleClose, job }) => {
    const [resumeFile, setResumeFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleCloseModal = () => {
        setResumeFile(null);
        setIsLoading(false);
        handleClose();
    };
    if (!show || !job) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Please upload a PDF file.');
                setResumeFile(null);
                return;
            }
            setResumeFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Please upload a PDF file.');
                setResumeFile(null);
                return;
            }
            setResumeFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!resumeFile) {
            toast.error('Please select a PDF resume to upload.');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('job', job.id);
        formData.append('resume', resumeFile);

        try {
            await api.post('applications/apply/', formData);

            toast.success('Application submitted! The AI is reviewing your resume.');

            setTimeout(() => {
                handleCloseModal();
            }, 2000);

        } catch (error) {
            console.error("Application error:", error.response?.data || error.message);
            let errorMsg = 'Failed to submit application. Please try again.';
            const data = error.response?.data;
            if (data) {
                if (typeof data === 'string') {
                    errorMsg = data;
                } else if (data.error) {
                    errorMsg = data.error;
                } else if (data.detail) {
                    errorMsg = data.detail;
                } else if (data.non_field_errors) {
                    errorMsg = Array.isArray(data.non_field_errors) ? data.non_field_errors.join(' ') : data.non_field_errors;
                } else {
                    const firstKey = Object.keys(data)[0];
                    if (firstKey) {
                        const val = data[firstKey];
                        errorMsg = `${firstKey}: ${Array.isArray(val) ? val.join(' ') : val}`;
                    }
                }
            }
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all duration-300">
            {/* Modal Container */}
            <div
                className="relative w-full max-w-lg scale-100 overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3">
                    <h3 className="flex items-center mb-0 gap-2 text-xl font-bold text-slate-800">
                        <CheckCircle size={24} style={{ color: T.primary }} />
                        Apply for <span className="text-primary text-capitalize">{job.title}</span>
                    </h3>
                    <button
                        onClick={handleCloseModal}
                        className="rounded-lg! cursor-pointer p-2 transition-colors hover:bg-slate-100 text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 pt-3 pb-4">
                    <p className="mb-6 text-sm text-slate-500 leading-relaxed">
                        Upload your latest resume. Our AI agent will match your skills against the job description for instant feedback.
                    </p>

                    {/* File Upload Zone */}
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-bold text-slate-700">Resume (PDF only)</label>
                        <div
                            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${isDragging
                                ? 'border-indigo-500 bg-indigo-50/50'
                                : resumeFile
                                    ? 'border-emerald-500 bg-emerald-50/30'
                                    : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-slate-100/50'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />

                            {resumeFile ? (
                                <div className="flex flex-col items-center text-emerald-600">
                                    <div className="mb-3 rounded-full bg-emerald-100 p-3 shadow-sm">
                                        <FileText size={32} />
                                    </div>
                                    <p className="font-semibold">{resumeFile.name}</p>
                                    <p className="mt-1 text-xs text-emerald-500">
                                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-slate-500 transition-colors group-hover:text-indigo-600">
                                    <div className={`mb-3 rounded-full p-3 shadow-sm transition-colors ${isDragging ? 'bg-indigo-100' : 'bg-white group-hover:bg-indigo-50'}`}>
                                        <UploadCloud size={32} />
                                    </div>
                                    <p className="font-semibold text-slate-700">Click to upload or drag and drop</p>
                                    <p className="mt-1 text-xs">PDF (Max 5MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="rounded-lg! px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors bg-slate-100 hover:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !resumeFile}
                            className="flex items-center gap-2 rounded-lg! px-6 py-2.5 text-sm font-bold text-indigo-100 shadow-md transition-all hover:scale-95 cursor-pointer"
                            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyJobModal;