import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import api from '../services/api';
import ApplyJobModal from '../components/Modals/ApplyJobModal';

const JobBoard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await api.get('jobs/');
                setJobs(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load available jobs.');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleApplyClick = (job) => {
        setSelectedJob(job);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Heading */}
            <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold text-gray-900">
                    Find Your Next Great Role
                </h2>
                <p className="mt-3 text-gray-500">
                    Browse open positions and let our AI match you to the perfect fit.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
                    {error}
                </div>
            )}

            {/* Job Cards */}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {jobs.map((job) => (
                    <div
                        key={job.id}
                        className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                        {/* Salary */}
                        <div className="mb-4">
                            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
                                {job.salary || "Salary Undisclosed"}
                            </span>
                        </div>

                        {/* Job Title */}
                        <h3 className="text-xl font-semibold text-gray-900">
                            {job.title}
                        </h3>

                        {/* Recruiter */}
                        <p className="mt-2 text-sm text-gray-500">
                            <i className="bi bi-building mr-1"></i>
                            Posted by {job.recruiter_name}
                        </p>

                        {/* Description */}
                        <p className="mt-4 flex-grow text-sm leading-6 text-gray-600">
                            {job.description.length > 120
                                ? `${job.description.substring(0, 120)}...`
                                : job.description}
                        </p>

                        {/* Skills */}
                        <div className="mt-6 mb-6 flex flex-wrap gap-2">
                            {job.required_skills?.map((skill, index) => (
                                <span
                                    key={index}
                                    className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>

                        {/* Apply Button */}
                        <button
                            onClick={() => handleApplyClick(job)}
                            className="mt-auto w-full rounded-xl border border-blue-600 py-3 font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white"
                        >
                            Apply Now
                        </button>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {jobs.length === 0 && !error && (
                <div className="py-20 text-center">
                    <i className="bi bi-search text-6xl text-gray-400"></i>
                    <p className="mt-4 text-gray-500">
                        No jobs are currently available. Check back soon!
                    </p>
                </div>
            )}

            {/* Modal */}
            <ApplyJobModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                job={selectedJob}
            />
        </div>
    );
};

export default JobBoard;