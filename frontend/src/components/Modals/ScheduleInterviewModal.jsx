import { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { scheduleInterview } from '../../services/api';

const ScheduleInterviewModal = ({ show, handleClose, application }) => {
    const [datetime, setDatetime] = useState('');
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!datetime || !link) {
            setMessage({ type: 'danger', text: 'Please provide both date/time and a meeting link.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await scheduleInterview(application.id, {
                interview_datetime: datetime,
                meeting_link: link
            });

            setMessage({ type: 'success', text: 'Interview scheduled and email sent!' });

            setTimeout(() => {
                handleClose();
                setDatetime('');
                setLink('');
                setMessage({ type: '', text: '' });
            }, 2000);

        } catch (error) {
            setMessage({ type: 'danger', text: error.error || 'Failed to schedule interview.' });
        } finally {
            setLoading(false);
        }
    };

    if (!application) return null;

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
                <Modal.Title className="fw-bold text-primary">
                    <i className="bi bi-calendar-event me-2"></i>Schedule Interview
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4 pb-4">
                <p className="text-muted mb-4">
                    Set up an interview with <strong>{application.candidate_name || 'this candidate'}</strong>. An automated email invitation will be sent immediately.
                </p>

                {message.text && <Alert variant={message.type}>{message.text}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Date & Time</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={datetime}
                            onChange={(e) => setDatetime(e.target.value)}
                            className="bg-light"
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Meeting Link (G-Meet / Zoom)</Form.Label>
                        <Form.Control
                            type="url"
                            placeholder="https://meet.google.com/xyz-abcd-efg"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className="bg-light"
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                        <Button variant="light" onClick={handleClose} className="me-2 rounded-pill px-4">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading} className="rounded-pill px-4">
                            {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Sending...</> : 'Send Invite'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ScheduleInterviewModal;