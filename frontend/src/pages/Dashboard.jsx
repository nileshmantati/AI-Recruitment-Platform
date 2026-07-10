import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostJobModal from '../components/PostJobModal';
import AnalyticsOverview from '../components/AnalyticsOverview';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import { updateApplicationStatus } from '../services/api';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardTopbar from '../components/DashboardTopbar';
import { T } from "../Js/theme.js";

const Dashboard = () => {
    const { auth } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("Dashboard");
    const [role, setRole] = useState(auth.role.toLowerCase());

    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [questionsLoading, setQuestionsLoading] = useState({});
    const [interviewQuestions, setInterviewQuestions] = useState({});
    const [statusLoading, setStatusLoading] = useState({});


    const [myApplications, setMyApplications] = useState([]);


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedAppForSchedule, setSelectedAppForSchedule] = useState(null);

    const handleOpenScheduleModal = (app) => {
        setSelectedAppForSchedule(app);
        setShowScheduleModal(true);
    };


    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await api.get('jobs/my/');
            setJobs(response.data);
            setError('');
            // Auto-select the first job and load its applicants
            if (response.data.length > 0 && !selectedJob) {
                handleJobClick(response.data[0]);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load jobs.');
        } finally {
            setLoading(false);
        }
    };


    const fetchMyApplications = async () => {
        setLoading(true);
        try {
            const response = await api.get('applications/my/');
            setMyApplications(response.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load your applications.');
        } finally {
            setLoading(false);
        }
    };

    /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
    useEffect(() => {
        if (role == 'recruiter') {
            fetchJobs();
        } else {
            fetchMyApplications();
        }
    }, [role]);
    /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */

    async function handleJobClick(job) {
        setSelectedJob(job);
        setApplicants([]);
        try {
            const response = await api.get(`applications/job/${job.id}/applicants/`);
            setApplicants(response.data);
        } catch (err) {
            console.error(err);
            setError('Could not fetch applicants.');
        }
    }

    const handleGenerateQuestions = async (applicationId) => {
        setQuestionsLoading(prev => ({ ...prev, [applicationId]: true }));
        try {
            const response = await api.get(`applications/${applicationId}/generate-questions/`);
            setInterviewQuestions(prev => ({ ...prev, [applicationId]: response.data.questions }));
        } catch (err) {
            console.error("Error generating questions:", err);
            const errorMsg = err.response?.data?.error || "Failed to generate questions. Please try again.";
            alert(errorMsg);
        } finally {
            setQuestionsLoading(prev => ({ ...prev, [applicationId]: false }));
        }
    };


    const handleStatusUpdate = async (applicationId, newStatus) => {
        setStatusLoading(prev => ({ ...prev, [applicationId]: newStatus }));
        try {
            await updateApplicationStatus(applicationId, newStatus);
            // Refresh applicants list to show updated status
            if (selectedJob) {
                const response = await api.get(`applications/job/${selectedJob.id}/applicants/`);
                setApplicants(response.data);
            }
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update application status.");
        } finally {
            setStatusLoading(prev => ({ ...prev, [applicationId]: null }));
        }
    };

    const getScoreColor = (score) => {
        if (score >= 85) return 'success';
        if (score >= 65) return 'warning text-dark';
        return 'danger';
    };

    const getStatusBadge = (status) => {
        const map = {
            'PENDING': { bg: 'secondary', label: 'Pending' },
            'EVALUATED': { bg: 'info', label: 'AI Evaluated' },
            'SHORTLISTED': { bg: 'success', label: 'Shortlisted' },
            'REJECTED': { bg: 'danger', label: 'Rejected' },
            'INTERVIEW_SCHEDULED': { bg: 'primary', label: 'Interview Scheduled' },
            'ERROR': { bg: 'dark', label: 'Error' },
        };
        const info = map[status] || { bg: 'secondary', label: status };
        return <Badge bg={info.bg} className="rounded-pill">{info.label}</Badge>;
    };

    if (loading && jobs.length === 0 && myApplications.length === 0) {
        return <Container className="text-center mt-5"><Spinner animation="border" variant="primary" /></Container>;
    }


    if (role === 'candidate') {
        return (
            <section className="flex h-screen w-full overflow-hidden" style={{ background: T.bg }}>
                <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} active={active} setActive={setActive} role={role} />
                <div className="flex-1 overflow-y-auto">
                    <DashboardTopbar role={role} />
                    <main className="flex-1">
                        <div className="space-y-6 p-6">
                            <h3 className="fw-bold text-dark mb-4">My Dashboard</h3>
                            {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

                            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                                        <i className="bi bi-person-fill text-primary fs-4"></i>
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-0">Welcome, {auth.username}!</h5>
                                        <span className="text-muted small">Candidate Account</span>
                                    </div>
                                </div>
                                <p className="text-muted">
                                    Browse open positions on the <a href="/jobs">Job Board</a> and apply with your resume.
                                    Our AI will automatically score and rank your application.
                                </p>
                            </Card>

                            <h5 className="fw-bold text-dark mb-3">My Applications</h5>
                            <Row>
                                {myApplications.map((app) => (
                                    <Col lg={4} md={6} key={app.id} className="mb-4">
                                        <Card className="h-100 shadow-sm border-0 rounded-4">
                                            <Card.Body className="p-4">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <Card.Title className="fw-bold mb-0">{app.job_details?.title}</Card.Title>
                                                    {getStatusBadge(app.status)}
                                                </div>
                                                <Card.Text className="text-muted small mb-2">
                                                    {app.job_details?.salary || 'Salary Undisclosed'}
                                                </Card.Text>
                                                <Card.Text className="text-muted small mb-3">
                                                    Applied: {new Date(app.applied_at).toLocaleDateString()}
                                                </Card.Text>

                                                {app.resume_score > 0 && (
                                                    <div className="mb-3">
                                                        <Badge
                                                            bg={getScoreColor(app.resume_score)}
                                                            className="p-2 fs-6 rounded-pill"
                                                        >
                                                            <i className="bi bi-stars me-1"></i>{app.resume_score}% Match
                                                        </Badge>
                                                    </div>
                                                )}

                                                {app.ai_feedback && (
                                                    <div className="bg-light bg-opacity-50 p-3 rounded-3 border">
                                                        <strong className="d-block text-success small mb-2 text-uppercase fw-bold">
                                                            <i className="bi bi-check-circle-fill me-2"></i>Strengths
                                                        </strong>
                                                        <div className="mb-2 d-flex flex-wrap gap-1">
                                                            {app.ai_feedback.strengths?.slice(0, 3).map((s, i) => (
                                                                <Badge bg="success" className="text-success border border-success fw-normal" key={i}>{s}</Badge>
                                                            ))}
                                                        </div>
                                                        <strong className="d-block text-danger small mb-2 text-uppercase fw-bold">
                                                            <i className="bi bi-exclamation-circle-fill me-2"></i>To Improve
                                                        </strong>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {app.ai_feedback.missing_skills?.slice(0, 3).map((s, i) => (
                                                                <Badge bg="danger" className="text-danger border border-danger fw-normal" key={i}>{s}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                                {myApplications.length === 0 && !error && (
                                    <Col className="text-center py-5">
                                        <i className="bi bi-briefcase text-muted display-1"></i>
                                        <p className="text-muted mt-3">You haven't applied to any jobs yet. Visit the <a href="/jobs">Job Board</a> to get started!</p>
                                    </Col>
                                )}
                            </Row>
                        </div>
                    </main>
                </div>
            </section>
        );
    }


    return (
        <section className="flex h-screen w-full overflow-hidden" style={{ background: T.bg }}>
            <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} active={active} setActive={setActive} role={role} />

            <div className="flex-1 overflow-y-auto">
                <DashboardTopbar role={role} />
                <main className="flex-1">
                    <div className="space-y-6 p-6">
                        {/* Dashboard Header with Post Job Button */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="fw-bold text-dark mb-0">Recruiter Overview</h3>
                            <Button
                                variant="primary"
                                className="rounded-pill shadow-sm px-4 fw-semibold"
                                onClick={() => setShowModal(true)}
                            >
                                <i className="bi bi-plus-lg me-2"></i>Post New Job
                            </Button>
                        </div>
                        {jobs ?
                            <AnalyticsOverview /> : <></>}
                        <Row>
                            {/* LEFT COLUMN: Active Jobs */}
                            <Col md={4} lg={3}>
                                <div className="bg-white rounded-4 shadow-sm p-3 h-100">
                                    <h6 className="text-uppercase text-muted fw-bold mb-3 ms-1 text-sm">Active Postings</h6>
                                    <ListGroup variant="flush">
                                        {jobs.map((job) => (
                                            <ListGroup.Item
                                                key={job.id}
                                                action
                                                active={selectedJob?.id === job.id}
                                                onClick={() => handleJobClick(job)}
                                                className={`p-3 mb-2 rounded-3 border-0 ${selectedJob?.id === job.id ? 'shadow-sm bg-primary text-white' : 'bg-light text-dark'}`}
                                            >
                                                <div className="fw-bold">{job.title}</div>
                                                <small className={selectedJob?.id === job.id ? 'text-white-50' : 'text-muted'}>
                                                    <i className="bi bi-geo-alt me-1"></i>{job.salary}
                                                </small>
                                            </ListGroup.Item>
                                        ))}
                                        {jobs.length === 0 && <p className="text-muted small ms-1">No jobs posted yet. Click "Post New Job" to start hiring.</p>}
                                    </ListGroup>
                                </div>
                            </Col>

                            {/* RIGHT COLUMN: AI Ranked Applicants */}
                            <Col md={8} lg={9}>
                                <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                                    <h5 className="mb-4 text-dark fw-bold">
                                        {selectedJob ? `Candidates for ${selectedJob.title}` : 'Select a job to view candidates'}
                                    </h5>

                                    {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

                                    {selectedJob && (
                                        <Row>
                                            {applicants.map((app) => (
                                                <Col xl={6} key={app.id} className="mb-4">
                                                    <Card className="h-100 shadow-sm border-0 rounded-4 border-top border-4 border-primary">
                                                        <Badge
                                                            bg={getScoreColor(app.resume_score)}
                                                            className="position-absolute top-0 end-0 m-3 p-2 fs-6 shadow-sm rounded-pill"
                                                        >
                                                            <i className="bi bi-stars me-1"></i>{app.resume_score}% Match
                                                        </Badge>

                                                        <Card.Body className="p-4">
                                                            <div className="d-flex align-items-center mb-3">
                                                                <div className="bg-light rounded-circle p-3 me-3 text-primary">
                                                                    <i className="bi bi-person-fill fs-4"></i>
                                                                </div>
                                                                <div>
                                                                    <Card.Title className="fw-bold mb-0">{app.candidate_name}</Card.Title>
                                                                    <div className="d-flex align-items-center gap-2 mt-1">
                                                                        <Card.Text className="text-muted small mb-0">Applied: {new Date(app.applied_at).toLocaleDateString()}</Card.Text>
                                                                        {getStatusBadge(app.status)}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {app.ai_feedback && (
                                                                <div className="mt-3 bg-light bg-opacity-50 p-3 rounded-3 border">
                                                                    <strong className="d-block text-success small mb-2 text-uppercase fw-bold">
                                                                        <i className="bi bi-check-circle-fill me-2"></i>Top Strengths
                                                                    </strong>
                                                                    <div className="mb-3 d-flex flex-wrap gap-1">
                                                                        {app.ai_feedback.strengths?.slice(0, 3).map((s, i) => (
                                                                            <Badge bg="success" className="text-success border border-success me-1 mb-1 fw-normal" key={i}>{s}</Badge>
                                                                        ))}
                                                                    </div>

                                                                    <strong className="d-block text-danger small mb-2 text-uppercase fw-bold mt-2">
                                                                        <i className="bi bi-exclamation-circle-fill me-2"></i>Missing Skills
                                                                    </strong>
                                                                    <div className="d-flex flex-wrap gap-1">
                                                                        {app.ai_feedback.missing_skills?.slice(0, 3).map((s, i) => (
                                                                            <Badge bg="danger" className="text-danger border border-danger me-1 fw-normal" key={i}>{s}</Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Card.Body>
                                                        <Card.Footer className="bg-white border-top-0 pb-4 px-4">
                                                            {/* Display questions if they exist */}
                                                            {interviewQuestions[app.id] && (
                                                                <div className="mb-3 bg-primary bg-opacity-10 p-3 rounded-3 border border-primary border-opacity-25">
                                                                    <h6 className="text-primary fw-bold mb-2">
                                                                        <i className="bi bi-robot me-2"></i>AI Suggested Questions:
                                                                    </h6>
                                                                    <ol className="mb-0 small text-dark ps-3">
                                                                        {interviewQuestions[app.id].map((q, idx) => (
                                                                            <li key={idx} className="mb-1">{q}</li>
                                                                        ))}
                                                                    </ol>
                                                                </div>
                                                            )}

                                                            {/* Action Buttons Row 1: AI Prep + Schedule */}
                                                            <div className="d-flex gap-2 mb-2">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    className="flex-fill fw-semibold rounded-pill"
                                                                    onClick={() => handleGenerateQuestions(app.id)}
                                                                    disabled={questionsLoading[app.id]}
                                                                >
                                                                    {questionsLoading[app.id] ? (
                                                                        <><Spinner as="span" animation="grow" size="sm" className="me-2" /> Generating...</>
                                                                    ) : (
                                                                        <><i className="bi bi-lightning-charge-fill me-1"></i> AI Prep</>
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="success"
                                                                    className="flex-fill fw-semibold rounded-pill text-white shadow-sm"
                                                                    onClick={() => handleOpenScheduleModal(app)}
                                                                >
                                                                    <i className="bi bi-calendar-event me-1"></i>Schedule
                                                                </Button>
                                                            </div>

                                                            {/* Action Buttons Row 2: Shortlist + Reject */}
                                                            <div className="d-flex gap-2">
                                                                <Button
                                                                    variant="outline-success"
                                                                    className="flex-fill fw-semibold rounded-pill"
                                                                    onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
                                                                    disabled={statusLoading[app.id] || app.status === 'SHORTLISTED'}
                                                                >
                                                                    {statusLoading[app.id] === 'SHORTLISTED' ? (
                                                                        <Spinner as="span" animation="border" size="sm" />
                                                                    ) : (
                                                                        <><i className="bi bi-check-circle me-1"></i>{app.status === 'SHORTLISTED' ? 'Shortlisted' : 'Shortlist'}</>
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    className="flex-fill fw-semibold rounded-pill"
                                                                    onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                                                                    disabled={statusLoading[app.id] || app.status === 'REJECTED'}
                                                                >
                                                                    {statusLoading[app.id] === 'REJECTED' ? (
                                                                        <Spinner as="span" animation="border" size="sm" />
                                                                    ) : (
                                                                        <><i className="bi bi-x-circle me-1"></i>{app.status === 'REJECTED' ? 'Rejected' : 'Reject'}</>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </Card.Footer>
                                                    </Card>
                                                </Col>
                                            ))}
                                            {applicants.length === 0 && !error && (
                                                <div className="text-center py-5">
                                                    <i className="bi bi-inbox text-muted display-1"></i>
                                                    <p className="text-muted mt-3">Waiting for candidates to apply...</p>
                                                </div>
                                            )}
                                        </Row>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </div>
                </main>
            </div>

            {/* Mount the Modal Component */}
            <PostJobModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                onJobPosted={fetchJobs}
            />

            {/* Mount the Schedule Interview Modal */}
            <ScheduleInterviewModal
                show={showScheduleModal}
                handleClose={() => {
                    setShowScheduleModal(false);
                    setSelectedAppForSchedule(null);
                    // Refresh applicants after scheduling
                    if (selectedJob) {
                        handleJobClick(selectedJob);
                    }
                }}
                application={selectedAppForSchedule}
            />
        </section >
    );
};

export default Dashboard;