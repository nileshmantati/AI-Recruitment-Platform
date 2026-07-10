import { useState, useEffect } from "react";
import { Card, Row, Col, Badge, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import api from '../../services/api';

const CandidateDashboard = ({ getScoreColor, getStatusBadge }) => {
    const { auth } = useAuth();
    const [myApplications, setMyApplications] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchMyApplications();
    }, []);

    if (loading) {
        return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;
    }

    return (
        <>
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
        </>
    )
}

export default CandidateDashboard