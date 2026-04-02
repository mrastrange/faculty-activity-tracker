import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Users, BookOpen, CheckCircle, BarChart2, Download, FileText, Check, X } from 'lucide-react';
import { ActivityDonutChart, CategoryStackedBar } from '../components/VisualCharts';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'approvals', 'reports', 'users'
    const [analytics, setAnalytics] = useState(null);
    const [allActivities, setAllActivities] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [analyticsRes, activitiesRes, usersRes] = await Promise.all([
                api.get('/dashboard/admin/analytics'),
                api.get('/activities/all'),
                api.get('/auth/all')
            ]);
            setAnalytics(analyticsRes.data);
            setAllActivities(activitiesRes.data);
            setAllUsers(usersRes.data);
        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (activityId, status, score) => {
        if (!window.confirm(`Are you sure you want to mark this activity as ${status}?`)) return;

        try {
            await api.put(`/activities/${activityId}/review`, {
                status,
                assigned_score: score || 0,
                review_comments: `Reviewed by Admin: ${status}`
            });
            // Refresh data to update metrics and lists
            fetchData();
        } catch (err) {
            alert('Failed to review activity');
        }
    };

    const exportToCSV = () => {
        if (allActivities.length === 0) return alert('No data to export');

        const headers = ['ID', 'Faculty Name', 'Department ID', 'Activity Title', 'Category', 'Date', 'Status', 'Assigned Score'];
        const csvRows = [headers.join(',')];

        allActivities.forEach(acc => {
            const row = [
                acc.id,
                `"${acc.first_name} ${acc.last_name}"`,
                acc.department_id || 'N/A',
                `"${acc.title}"`,
                `"${acc.category}"`,
                new Date(acc.date_of_activity).toLocaleDateString(),
                acc.status,
                acc.assigned_score || 0
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `faculty_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading && !analytics) return <div style={{ padding: '2rem' }}>Loading Admin Analytics...</div>;

    const pendingActivities = allActivities.filter(a => a.status === 'Pending');

    return (
        <div className="app-container">
            <aside style={{ width: '250px', background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                    <img src="/img/ssn_logo.png" alt="SSN Logo" style={{ height: '40px', width: 'auto' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', color: activeTab === 'analytics' ? 'var(--primary)' : 'var(--text-main)', fontWeight: activeTab === 'analytics' ? '600' : '400' }}
                    >
                        <BarChart2 size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                        Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('approvals')}
                        style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', color: activeTab === 'approvals' ? 'var(--primary)' : 'var(--text-main)', fontWeight: activeTab === 'approvals' ? '600' : '400' }}
                    >
                        <CheckCircle size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                        Approval Queue {pendingActivities.length > 0 && <span style={{ background: 'var(--danger)', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: 'auto' }}>{pendingActivities.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', color: activeTab === 'reports' ? 'var(--primary)' : 'var(--text-main)', fontWeight: activeTab === 'reports' ? '600' : '400' }}
                    >
                        <FileText size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                        Full Reports
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-main)', fontWeight: activeTab === 'users' ? '600' : '400' }}
                    >
                        <Users size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                        User Directory
                    </button>

                    <Link to="/graphs" style={{ textDecoration: 'none', color: 'var(--text-main)', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '1.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                        <BarChart2 size={18} />
                        Merit Scoring Graphs
                    </Link>

                    <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>User: {user?.first_name} ({user?.role})</p>
                        <button onClick={logout} className="btn" style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                            Sign Out
                        </button>
                    </div>
                </nav>
            </aside>

            <main className="main-content">
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>{activeTab === 'analytics' && 'College API Analytics'}
                            {activeTab === 'approvals' && 'Pending Approvals'}
                            {activeTab === 'reports' && 'Activity Reports'}
                            {activeTab === 'users' && 'User Directory'}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>Manage and oversee faculty performance across the institution.</p>
                    </div>
                    {activeTab === 'reports' && (
                        <button onClick={exportToCSV} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Download size={18} /> Export to CSV
                        </button>
                    )}
                </header>

                {/* --- ANALYTICS TAB --- */}
                {activeTab === 'analytics' && (
                    <>
                        <div className="metrics-grid">
                            <div className="card metric-card">
                                <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--primary)' }}>
                                    <BarChart2 size={24} />
                                </div>
                                <div className="metric-value">{analytics?.collegeAverage}</div>
                                <div className="metric-label">Avg College API</div>
                            </div>
                            <div className="card metric-card">
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--success)' }}>
                                    <CheckCircle size={24} />
                                </div>
                                <div className="metric-value" style={{ color: 'var(--success)' }}>{pendingActivities.length}</div>
                                <div className="metric-label">Activities Awaiting Review</div>
                            </div>
                            <div className="card metric-card">
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--danger)' }}>
                                    <BookOpen size={24} />
                                </div>
                                <div className="metric-value" style={{ color: 'var(--danger)' }}>{allActivities.length}</div>
                                <div className="metric-label">Total Submissions Recorded</div>
                            </div>
                        </div>

                        {/* --- NEW ADMIN SPLIT VISUALIZATIONS --- */}
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div className="card" style={{ width: '30%', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <h3 style={{ margin: '0 0 2rem 0', color: '#312e81', fontSize: '1.1rem', alignSelf: 'flex-start' }}>College Approval Status</h3>
                                <ActivityDonutChart
                                    approved={allActivities.filter(a => a.status === 'Approved').length}
                                    pending={allActivities.filter(a => a.status === 'Pending').length}
                                    rejected={allActivities.filter(a => a.status === 'Rejected').length}
                                />
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <CategoryStackedBar
                                    categoryName="Teaching"
                                    totalScore={allActivities.filter(a => a.category === 'Teaching' && a.status === 'Approved').reduce((acc, a) => acc + (parseFloat(a.assigned_score) || 0), 0)}
                                    approved={allActivities.filter(a => a.category === 'Teaching' && a.status === 'Approved').length}
                                    pending={allActivities.filter(a => a.category === 'Teaching' && a.status === 'Pending').length}
                                    rejected={allActivities.filter(a => a.category === 'Teaching' && a.status === 'Rejected').length}
                                />
                                <CategoryStackedBar
                                    categoryName="Co-curricular"
                                    totalScore={allActivities.filter(a => a.category === 'Co-curricular' && a.status === 'Approved').reduce((acc, a) => acc + (parseFloat(a.assigned_score) || 0), 0)}
                                    approved={allActivities.filter(a => a.category === 'Co-curricular' && a.status === 'Approved').length}
                                    pending={allActivities.filter(a => a.category === 'Co-curricular' && a.status === 'Pending').length}
                                    rejected={allActivities.filter(a => a.category === 'Co-curricular' && a.status === 'Rejected').length}
                                />
                                <CategoryStackedBar
                                    categoryName="Research"
                                    totalScore={allActivities.filter(a => a.category === 'Research' && a.status === 'Approved').reduce((acc, a) => acc + (parseFloat(a.assigned_score) || 0), 0)}
                                    approved={allActivities.filter(a => a.category === 'Research' && a.status === 'Approved').length}
                                    pending={allActivities.filter(a => a.category === 'Research' && a.status === 'Pending').length}
                                    rejected={allActivities.filter(a => a.category === 'Research' && a.status === 'Rejected').length}
                                />
                            </div>
                        </div>

                        <div className="card">
                            <h2>Top Faculty Performers</h2>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Faculty Name</th>
                                            <th>Teaching</th>
                                            <th>Co-curricular</th>
                                            <th>Research</th>
                                            <th>Total API Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics?.topPerformers?.map((faculty, idx) => (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: '500' }}>{faculty.first_name} {faculty.last_name}</td>
                                                <td>{faculty.teaching_score || 0}</td>
                                                <td>{faculty.co_curricular_score || 0}</td>
                                                <td>{faculty.research_score || 0}</td>
                                                <td style={{ color: 'var(--primary)', fontWeight: '600' }}>{faculty.total_score}</td>
                                            </tr>
                                        ))}
                                        {(!analytics?.topPerformers || analytics.topPerformers.length === 0) && (
                                            <tr><td colSpan="5">No score data available yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* --- APPROVALS TAB --- */}
                {activeTab === 'approvals' && (
                    <div className="card">
                        <h2>Action Required: Approval Queue</h2>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Faculty</th>
                                        <th>Activity Title</th>
                                        <th>Category</th>
                                        <th>Date</th>
                                        <th>Requested Pts</th>
                                        <th>Proof</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingActivities.map((activity) => (
                                        <tr key={activity.id}>
                                            <td>{activity.first_name} {activity.last_name}</td>
                                            <td>{activity.title}</td>
                                            <td>{activity.category}</td>
                                            <td>{new Date(activity.date_of_activity).toLocaleDateString()}</td>
                                            <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{activity.suggested_score} pts</td>
                                            <td>
                                                <a href={`http://localhost:5000/${activity.proof_document_path}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                                                    View Document
                                                </a>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleReview(activity.id, 'Approved', activity.suggested_score || 0)} className="btn" style={{ background: 'var(--success)', color: 'white', padding: '0.5rem 1rem' }}>
                                                        <Check size={16} style={{ display: 'inline', marginRight: '4px' }} /> Approve
                                                    </button>
                                                    <button onClick={() => handleReview(activity.id, 'Rejected', 0)} className="btn" style={{ background: 'var(--danger)', color: 'white', padding: '0.5rem 1rem' }}>
                                                        <X size={16} style={{ display: 'inline', marginRight: '4px' }} /> Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {pendingActivities.length === 0 && (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No activities pending review.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- REPORTS TAB --- */}
                {activeTab === 'reports' && (
                    <div className="card">
                        <h2>Full Institution Activity Log</h2>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Dept ID</th>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Date Submitted</th>
                                        <th>Status</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allActivities.map(activity => (
                                        <tr key={activity.id}>
                                            <td style={{ color: 'var(--text-muted)' }}>#{activity.id}</td>
                                            <td style={{ fontWeight: '500' }}>{activity.first_name} {activity.last_name}</td>
                                            <td>{activity.department_id || '-'}</td>
                                            <td>{activity.title}</td>
                                            <td>{activity.category}</td>
                                            <td>{new Date(activity.submitted_at).toLocaleDateString()}</td>
                                            <td>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem',
                                                    background: activity.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : activity.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                    color: activity.status === 'Approved' ? 'var(--success)' : activity.status === 'Rejected' ? 'var(--danger)' : '#8b5cf6'
                                                }}>
                                                    {activity.status}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: '600', color: activity.assigned_score > 0 ? 'var(--primary)' : 'var(--text-main)' }}>
                                                {activity.assigned_score || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- USERS TAB --- */}
                {activeTab === 'users' && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Faculty & User Directory</h2>
                            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={18} /> Add New User
                            </button>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Track / Designation</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsers.map((u) => (
                                        <tr key={u.id}>
                                            <td style={{ fontWeight: '500' }}>{u.first_name}</td>
                                            <td style={{ fontWeight: '500' }}>{u.last_name}</td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className={`badge`} style={{ background: u.role === 'Admin' ? '#fee2e2' : u.role === 'HOD' ? '#fef3c7' : '#e0e7ff', color: u.role === 'Admin' ? '#991b1b' : u.role === 'HOD' ? '#92400e' : '#3730a3' }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td>{u.designation || 'N/A'}</td>
                                            <td>
                                                {u.is_verified ? (
                                                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}><CheckCircle size={14} /> Verified</span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>Pending Setup</span>
                                                )}
                                            </td>
                                            <td>
                                                <Link to={`/professor/${u.id}`} className="btn" style={{ background: 'transparent', color: 'var(--primary)', padding: '0.25rem 0.5rem', textDecoration: 'none', display: 'inline-block' }}>
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {allUsers.length === 0 && (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default AdminDashboard;
