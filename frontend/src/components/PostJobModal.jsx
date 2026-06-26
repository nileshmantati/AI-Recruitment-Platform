import { useState } from 'react';
import { Modal, Button, Form, FloatingLabel, Spinner } from 'react-bootstrap';
import api from '../services/api';

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
            // Format skills from a comma-separated string to an array
            const formattedData = {
                ...formData,
                required_skills: formData.required_skills.split(',').map(skill => skill.trim())
            };
            
            await api.post('jobs/', formattedData);
            onJobPosted(); // Refresh the job list on the dashboard
            handleClose(); // Close the modal
            setFormData({ title: '', description: '', required_skills: '', salary: '' }); // Reset form
        } catch (error) {
            console.error("Error posting job:", error);
            alert("Failed to post job. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton className="border-0 pb-0 mt-3 mx-3">
                <Modal.Title className="fw-bold text-primary">
                    <i className="bi bi-briefcase me-2"></i>Post a New Job
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4 pb-4">
                <p className="text-muted mb-4">Fill out the details below. Our AI will use this description to rank candidates.</p>
                <Form onSubmit={handleSubmit}>
                    
                    <FloatingLabel controlId="title" label="Job Title (e.g., Senior Django Developer)" className="mb-3">
                        <Form.Control 
                            type="text" name="title" placeholder="Job Title" 
                            value={formData.title} onChange={handleChange} required 
                            className="rounded-3"
                        />
                    </FloatingLabel>

                    <FloatingLabel controlId="salary" label="Salary Range (e.g., $100k - $120k)" className="mb-3">
                        <Form.Control 
                            type="text" name="salary" placeholder="Salary Range" 
                            value={formData.salary} onChange={handleChange} required 
                            className="rounded-3"
                        />
                    </FloatingLabel>

                    <FloatingLabel controlId="skills" label="Required Skills (comma separated)" className="mb-3">
                        <Form.Control 
                            type="text" name="required_skills" placeholder="Python, Django, React" 
                            value={formData.required_skills} onChange={handleChange} required 
                            className="rounded-3"
                        />
                    </FloatingLabel>

                    <FloatingLabel controlId="description" label="Detailed Job Description" className="mb-4">
                        <Form.Control 
                            as="textarea" name="description" placeholder="Description" 
                            style={{ height: '150px' }} value={formData.description} 
                            onChange={handleChange} required className="rounded-3"
                        />
                    </FloatingLabel>

                    <div className="d-flex justify-content-end mt-4">
                        <Button variant="light" onClick={handleClose} className="me-2 rounded-pill px-4">
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isLoading} className="rounded-pill px-4 shadow-sm">
                            {isLoading ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Posting...</> : 'Publish Job'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default PostJobModal;