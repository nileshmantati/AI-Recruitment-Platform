import { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import api from '../../services/api';

const ApplyJobModal = ({ show, handleClose, job }) => {
    const [resumeFile, setResumeFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleFileChange = (e) => {
        setResumeFile(e.target.files[0]);
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!resumeFile) {
            setMessage({ type: 'danger', text: 'Please select a PDF resume to upload.' });
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('job', job.id);
        formData.append('resume', resumeFile);

        try {
            await api.post('applications/apply/', formData);

            setMessage({ type: 'success', text: 'Application submitted! The AI is reviewing your resume.' });

            setTimeout(() => {
                handleClose();
                setResumeFile(null);
                setMessage({ type: '', text: '' });
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
            setMessage({ type: 'danger', text: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    if (!job) return null;

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
                <Modal.Title className="fw-bold text-primary">
                    <i className="bi bi-send-check me-2"></i>Apply for {job.title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4 pb-4">
                <p className="text-muted mb-4">
                    Upload your latest resume. Our AI agent will match your skills against the job description for instant feedback.
                </p>

                {message.text && <Alert variant={message.type} className="rounded-3">{message.text}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formFile" className="mb-4">
                        <Form.Label className="fw-semibold">Resume (PDF only)</Form.Label>
                        <Form.Control
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="rounded-3 p-2 bg-light"
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-end mt-2">
                        <Button variant="light" onClick={handleClose} className="me-2 rounded-pill px-4">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isLoading} className="rounded-pill px-4 shadow-sm">
                            {isLoading ? (
                                <><Spinner as="span" animation="border" size="sm" className="me-2" />Submitting...</>
                            ) : (
                                'Submit Application'
                            )}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ApplyJobModal;