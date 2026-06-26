import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import api from '../services/api';
import ApplyJobModal from '../components/ApplyJobModal';

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

    if (loading) return <Container className="text-center mt-5"><Spinner animation="border" variant="primary" /></Container>;

    return (
        <Container className="py-4">
            <div className="text-center mb-5">
                <h2 className="fw-bold text-dark">Find Your Next Great Role</h2>
                <p className="text-muted">Browse open positions and let our AI match you to the perfect fit.</p>
            </div>

            {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

            <Row>
                {jobs.map((job) => (
                    <Col lg={4} md={6} key={job.id} className="mb-4">
                        <Card className="h-100 shadow-sm border-0 rounded-4 transition-hover">
                            <Card.Body className="p-4 d-flex flex-column">
                                <div className="mb-3">
                                    <Badge bg="primary" bg-opacity="10" className="text-primary rounded-pill px-3 py-2 border border-primary fw-normal">
                                        {job.salary || 'Salary Undisclosed'}
                                    </Badge>
                                </div>

                                <Card.Title className="fw-bold fs-5 mb-1">{job.title}</Card.Title>
                                <Card.Text className="text-muted small mb-3">
                                    <i className="bi bi-building me-1"></i> Posted by {job.recruiter_name}
                                </Card.Text>

                                <Card.Text className="text-secondary small flex-grow-1">
                                    {/* Truncate long descriptions */}
                                    {job.description.length > 120 ? `${job.description.substring(0, 120)}...` : job.description}
                                </Card.Text>

                                <div className="mt-3 mb-4 d-flex flex-wrap gap-1">
                                    {job.required_skills?.map((skill, index) => (
                                        <Badge bg="light" text="dark" className="border fw-normal" key={index}>
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>

                                <Button
                                    variant="outline-primary"
                                    className="w-100 rounded-pill mt-auto fw-semibold"
                                    onClick={() => handleApplyClick(job)}
                                >
                                    Apply Now
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}

                {jobs.length === 0 && !error && (
                    <Col className="text-center py-5">
                        <i className="bi bi-search text-muted display-1"></i>
                        <p className="text-muted mt-3">No jobs are currently available. Check back soon!</p>
                    </Col>
                )}
            </Row>

            {/* Application Modal */}
            <ApplyJobModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                job={selectedJob}
            />
        </Container>
    );
};

export default JobBoard;