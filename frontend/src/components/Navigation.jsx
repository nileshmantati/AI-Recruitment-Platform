import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const navigate = useNavigate();
    const { auth, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar bg="white" expand="lg" className="shadow-sm mb-4 py-3">
            <Container>
                <Navbar.Brand as={Link} to="/" className="text-primary fw-bold">
                    <i className="bi bi-robot me-2"></i>AI Recruiter
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center">
                        <Nav.Link as={Link} to="/jobs" className="me-3 fw-semibold text-dark">
                            Find Jobs
                        </Nav.Link>
                        {auth.isAuthenticated ? (
                            <>
                                <Nav.Link as={Link} to="/dashboard" className="me-3 fw-semibold text-dark">
                                    Dashboard
                                </Nav.Link>
                                <div className="d-flex align-items-center me-4 px-3 py-1 rounded-pill bg-white shadow-sm border">
                                    {/* User Icon */}
                                    <FaUserCircle size={24} className="text-primary me-2" />

                                    {/* User Name */}
                                    <span className="fw-bold text-dark" style={{ fontSize: "15px", letterSpacing: "0.5px" }}>
                                        {auth.username}
                                    </span>
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login" className="me-2">Login</Nav.Link>
                                <Button as={Link} to="/register" variant="primary" size="sm">
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;