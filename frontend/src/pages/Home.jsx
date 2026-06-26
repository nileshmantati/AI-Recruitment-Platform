import React from 'react'
import { Link } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { auth } = useAuth();

    return (
        <>
            <Container className="mt-5 text-center">
                <Card className="border-0 shadow-sm p-5">
                    <h1 className="display-4 text-primary fw-bold">
                        <i className="bi bi-robot me-3"></i>
                        AI Recruitment Platform
                    </h1>
                    <p className="lead mt-3 text-secondary">Smarter hiring, powered by Agentic AI.</p>
                    <div className="mt-4">
                        {auth.isAuthenticated ? (
                            <>
                                <Link to="/dashboard">
                                    <Button variant="primary" size="lg" className="me-3 px-4 shadow-sm">Go to Dashboard</Button>
                                </Link>
                                <Link to="/jobs">
                                    <Button variant="outline-primary" size="lg" className="px-4 shadow-sm">Browse Jobs</Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="primary" size="lg" className="me-3 px-4 shadow-sm">Login</Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="outline-primary" size="lg" className="px-4 shadow-sm">Create Account</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </Card>
            </Container>
        </>
    )
}

export default Home