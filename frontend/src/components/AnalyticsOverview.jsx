import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const AnalyticsOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Call the new Django endpoint
                const response = await api.get('analytics/recruiter-stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <Spinner animation="border" size="sm" className="mt-3" />;
    if (!stats) return null;

    return (
        <div className="mb-4">
            {/* Top Stat Cards */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="shadow-sm border-0 rounded-4 border-start border-4 border-primary bg-white h-100 p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted text-uppercase mb-1" style={{ fontSize: '0.8rem' }}>Total Jobs Posted</h6>
                                <h3 className="fw-bold mb-0 text-dark">{stats.total_jobs}</h3>
                            </div>
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                                <i className="bi bi-briefcase-fill fs-4"></i>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 rounded-4 border-start border-4 border-success bg-white h-100 p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted text-uppercase mb-1" style={{ fontSize: '0.8rem' }}>Total Applications</h6>
                                <h3 className="fw-bold mb-0 text-dark">{stats.total_applications}</h3>
                            </div>
                            <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                                <i className="bi bi-people-fill fs-4"></i>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 rounded-4 border-start border-4 border-warning bg-white h-100 p-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted text-uppercase mb-1" style={{ fontSize: '0.8rem' }}>Shortlisted</h6>
                                <h3 className="fw-bold mb-0 text-dark">{stats.shortlisted}</h3>
                            </div>
                            <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                                <i className="bi bi-star-fill fs-4"></i>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
            {/* Recharts Bar Chart */}
            {stats.total_jobs > 0 && (
                < Card className="shadow-sm border-0 rounded-4 p-4 bg-white">
                    <h6 className="fw-bold text-dark mb-4">Applications Per Job</h6>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6c757d' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6c757d' }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(13, 110, 253, 0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="applicants" fill="#0d6efd" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            )
            }
        </div >
    );
};

export default AnalyticsOverview;