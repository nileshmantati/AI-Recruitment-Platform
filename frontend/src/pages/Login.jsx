// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { auth, login } = useAuth();

    // Fix #6: Redirect if already logged in
    if (auth.isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send credentials to Django custom JWT endpoint (returns role + username)
            const response = await api.post('users/login/', credentials);

            // Use AuthContext to store auth state reactively
            login(
                response.data.access,
                response.data.refresh,
                response.data.username,
                response.data.role
            );
            // Redirect to the dashboard
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid username or password.');
            console.error(err);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center mt-5">
            <Card className="shadow p-4" style={{ width: '400px' }}>
                <h3 className="text-center mb-4">Welcome Back</h3>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" name="username" required onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name="password" required onChange={handleChange} />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100 mb-3">
                        Login
                    </Button>
                </Form>
                <div className="text-center">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </div>
            </Card>
        </Container>
    );
};

export default Login;