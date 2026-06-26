// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const { auth } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'CANDIDATE' // Default role
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Fix #6: Redirect if already logged in
    if (auth.isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send data to Django backend
            await api.post('users/register/', formData);
            // If successful, redirect to login page
            navigate('/login');
        } catch (err) {
            console.error("Registration error:", err);

            // If the backend sent error details, format them for display
            if (err.response && err.response.data) {
                const backendErrors = Object.values(err.response.data).join(' | ');
                setError(`Registration failed: ${backendErrors}`);
            } else {
                // Network error or server is unreachable
                setError('Registration failed. Network error or server is down.');
            }
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center mt-5">
            <Card className="shadow p-4" style={{ width: '400px' }}>
                <h3 className="text-center mb-4">Create Account</h3>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" name="username" required onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" required onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name="password" required onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>I am a...</Form.Label>
                        <Form.Select name="role" onChange={handleChange}>
                            <option value="CANDIDATE">Candidate (Looking for Jobs)</option>
                            <option value="RECRUITER">Recruiter (Hiring)</option>
                        </Form.Select>
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100 mb-3">
                        Register
                    </Button>
                </Form>
                <div className="text-center">
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </Card>
        </Container>
    );
};

export default Register;