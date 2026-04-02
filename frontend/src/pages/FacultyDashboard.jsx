import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Award, CheckCircle, Clock, XCircle, Plus, ChevronRight, ChevronLeft, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActivityDonutChart, CategoryStackedBar } from '../components/VisualCharts';

const ActivityCard = ({ activity }) => {
    const handleDownload = async () => {
        try {
            const response = await api.get(`/activities/${activity.id}/document`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: activity.proof_document_mime || 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', activity.proof_document_name || 'document.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (e) {
            alert("No document found or download failed");
        }
    };

    return (
        <div style={{
            minWidth: '250px',
            maxWidth: '250px',
            padding: '1.25rem',
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                <span>{new Date(activity.date_of_activity).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className={`badge badge-${activity.status.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>{activity.status}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '4px', height: '16px', background: '#f2722b', borderRadius: '4px' }}></div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={activity.title}>
                    {activity.title}
                </h4>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={activity.description}>
                {activity.description}
            </p>
            {activity.proof_document_name && (
                <button onClick={handleDownload} style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe', borderRadius: '0.25rem', cursor: 'pointer', alignSelf: 'flex-start' }}>
                    View Evidence
                </button>
            )}
        </div>
    );
};

const EmptyAddCard = ({ category, significance }) => (
    <Link to="/submit" style={{ textDecoration: 'none' }}>
        <div style={{
            minWidth: '250px',
            maxWidth: '250px',
            height: '140px',
            padding: '1.25rem',
            background: '#f8fafc',
            borderRadius: '0.75rem',
            border: '2px dashed #cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            color: '#f2722b',
            transition: 'background 0.2s'
        }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
        >
            <Plus size={32} strokeWidth={3} />
            <span style={{ fontWeight: '600', color: '#334155' }}>Add Activity</span>
        </div>
    </Link>
);

const HorizontalScrollRow = ({ title, activities, category }) => {
    return (
        <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: '500', margin: 0, whiteSpace: 'nowrap' }}>{title}</h3>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{activities.length} items</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ChevronLeft color="#cbd5e1" size={28} style={{ cursor: 'not-allowed' }} />

                <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', padding: '0.5rem 0.5rem', scrollbarWidth: 'none' }}>
                    {activities.map(a => (
                        <ActivityCard key={a.id} activity={a} />
                    ))}
                    <EmptyAddCard category={category} />
                </div>

                <ChevronRight color="#cbd5e1" size={28} style={{ cursor: 'not-allowed' }} />
            </div>
        </div>
    );
};

const ProfileView = ({ user }) => {
    const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : '';

    return (
        <div style={{ maxWidth: '800px' }}>
            {/* Basic Info */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f2722b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', marginRight: '2rem' }}>
                    {initials}
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a' }}>{user?.first_name} {user?.last_name}</h2>
                    <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '1.1rem' }}>{user?.designation || 'Faculty Member'}</p>
                </div>
            </div>

            {/* Academic Information */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>Academic Information</h3>
                <div style={{ display: 'flex', gap: '3rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Designation / Track</label>
                        <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a' }}>
                            {user?.designation || 'Not Specified'}
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Qualification</label>
                        <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a' }}>
                            {user?.qualification || 'Not Specified'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>Contact Information</h3>
                <div style={{ display: 'flex', gap: '3rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Email Address</label>
                        <div style={{ padding: '0.75rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#64748b' }}>
                            {user?.email}
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Department ID</label>
                        <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a' }}>
                            {user?.department_id || 'Not Assigned'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NarrativeEditor = ({ category, currentYear }) => {
    const [narrative, setNarrative] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        const fetchNarrative = async () => {
            try {
                const response = await api.get(`/narratives?category=${category}&academic_year=${currentYear}`);
                if (response.data && response.data.narrative_text) {
                    setNarrative(response.data.narrative_text);
                    setLastSaved(new Date(response.data.updated_at));
                } else {
                    setNarrative('');
                    setLastSaved(null);
                }
            } catch (error) {
                console.error("Failed to fetch narrative", error);
            }
        };
        fetchNarrative();
    }, [category, currentYear]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await api.post('/narratives', {
                category,
                academic_year: currentYear,
                narrative_text: narrative
            });
            setLastSaved(new Date(response.data.updated_at));
        } catch (error) {
            console.error("Failed to save narrative", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ marginBottom: '3rem', background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 'bold', margin: 0 }}>{category} Narrative Report</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {isSaving ? (
                        <>Saving...</>
                    ) : lastSaved ? (
                        <><CheckCircle size={14} color="#10b981" /> Last saved {lastSaved.toLocaleTimeString()}</>
                    ) : (
                        'Not saved yet'
                    )}
                </span>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1rem' }}>
                Provide a summary of your key contributions, methodologies, and outcomes in {category.toLowerCase()} for the {currentYear} academic year.
            </p>

            <textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder={`Write your ${category.toLowerCase()} narrative here...`}
                style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    fontSize: '1rem',
                    color: '#334155',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    marginBottom: '1rem'
                }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        padding: '0.5rem 1.5rem',
                        background: '#0f172a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        fontWeight: '600',
                        cursor: isSaving ? 'wait' : 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    {isSaving ? 'Saving...' : 'Save Narrative'}
                </button>
            </div>
        </div>
    );
};

const FacultyDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [metrics, setMetrics] = useState({ totalScore: 0, pending: 0, approved: 0, rejected: 0 });
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI Filter State
    const [activeTab, setActiveTab] = useState('Annual Report');
    const [narrativesList, setNarrativesList] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/dashboard/faculty');
                setMetrics(response.data.metrics);
                setActivities(response.data.recentActivities);

                if (user?.id) {
                    const narrativesRes = await api.get(`/narratives/faculty/${user.id}`);
                    setNarrativesList(narrativesRes.data);
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.id]);

    if (loading) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;

    // Filter activities by current tab
    const filteredActivities = activities.filter(a => a.category === activeTab);

    // Group by Status
    const approvedList = filteredActivities.filter(a => a.status === 'Approved');
    const pendingList = filteredActivities.filter(a => a.status === 'Pending');
    const rejectedList = filteredActivities.filter(a => a.status === 'Rejected');

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="app-container" style={{ display: 'flex', background: '#fff' }}>
            {/* Sidebar matches Screenshot Layout */}
            <aside style={{ width: '250px', padding: '2rem 0', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0' }}>
                <div style={{ padding: '0 2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/img/ssn_logo.png" alt="SSN Logo" style={{ height: '40px', width: 'auto' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                        onClick={() => setActiveTab('Profile')}
                        style={{ padding: '0.75rem 2rem', cursor: 'pointer', color: activeTab === 'Profile' ? '#f2722b' : '#64748b', fontWeight: activeTab === 'Profile' ? '600' : '500', background: activeTab === 'Profile' ? '#fff6f0' : 'transparent', borderRight: activeTab === 'Profile' ? '3px solid #f2722b' : 'none' }}>
                        My Profile
                    </div>
                    <div
                        onClick={() => setActiveTab('Annual Report')}
                        style={{ padding: '0.75rem 2rem', cursor: 'pointer', color: activeTab === 'Annual Report' ? '#10b981' : '#64748b', fontWeight: activeTab === 'Annual Report' ? '600' : '500', background: activeTab === 'Annual Report' ? '#ecfdf5' : 'transparent', borderRight: activeTab === 'Annual Report' ? '3px solid #10b981' : 'none' }}>
                        Annual Report
                    </div>
                    <Link to="/submit" style={{ padding: '0.75rem 2rem', cursor: 'pointer', color: '#0f172a', fontWeight: '600', textDecoration: 'none', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                        Submit a New Activity
                    </Link>

                    <div style={{ padding: '0.5rem 2rem', color: '#0f172a', fontWeight: 'bold', marginBottom: '0.5rem' }}>Submissions</div>

                    {/* Inner Links for Categories */}
                    <div
                        onClick={() => setActiveTab('Teaching')}
                        style={{ padding: '0.5rem 2rem 0.5rem 3rem', cursor: 'pointer', color: activeTab === 'Teaching' ? '#f2722b' : '#64748b', borderRight: activeTab === 'Teaching' ? '3px solid #f2722b' : 'none', fontWeight: activeTab === 'Teaching' ? '600' : 'normal' }}
                    >
                        Teaching
                    </div>
                    <div
                        onClick={() => setActiveTab('Research')}
                        style={{ padding: '0.5rem 2rem 0.5rem 3rem', cursor: 'pointer', color: activeTab === 'Research' ? '#f2722b' : '#64748b', borderRight: activeTab === 'Research' ? '3px solid #f2722b' : 'none', fontWeight: activeTab === 'Research' ? '600' : 'normal' }}
                    >
                        Research
                    </div>
                    <div
                        onClick={() => setActiveTab('Service')}
                        style={{ padding: '0.5rem 2rem 0.5rem 3rem', cursor: 'pointer', color: activeTab === 'Service' ? '#f2722b' : '#64748b', borderRight: activeTab === 'Service' ? '3px solid #f2722b' : 'none', fontWeight: activeTab === 'Service' ? '600' : 'normal' }}
                    >
                        Service
                    </div>
                </nav>

                <div style={{ marginTop: 'auto', padding: '0 2rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>{user?.email}</p>
                    <button onClick={logout} style={{ width: '100%', padding: '0.5rem', background: '#b91c1c', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>Sign Out</button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto', background: '#fafafa' }}>
                <h1 className="print-header" style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '3rem', fontWeight: 'bold' }}>
                    {activeTab === 'Profile' ? 'My Profile' : activeTab === 'Annual Report' ? `Annual Activity Report (${new Date().getFullYear()})` : activeTab}
                </h1>

                {/* API Score Metric Cards */}
                {activeTab !== 'Profile' && (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem'
                    }}>
                        <div className="card metric-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teaching Score</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f2722b', marginTop: '0.5rem' }}>{metrics.teachingScore || 0}</div>
                        </div>
                        <div className="card metric-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Co-curricular Score</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0ea5e9', marginTop: '0.5rem' }}>{metrics.coCurricularScore || 0}</div>
                        </div>
                        <div className="card metric-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Research Score</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#8b5cf6', marginTop: '0.5rem' }}>{metrics.researchScore || 0}</div>
                        </div>
                        <div className="card metric-card print-primary" style={{ background: 'var(--primary)', color: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>Total API Score</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginTop: '0.5rem' }}>{metrics.totalScore || 0}</div>
                        </div>
                    </div>
                )}

                {activeTab === 'Profile' && <ProfileView user={user} />}

                {/* Standard Edit Categories */}
                {(activeTab === 'Teaching' || activeTab === 'Research' || activeTab === 'Admin') && (
                    <>
                        <NarrativeEditor category={activeTab} currentYear={new Date().getFullYear().toString()} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#0f172a' }}>Logged Activities</h2>
                            <span className="badge badge-pending">{filteredActivities.length} Total</span>
                        </div>
                        <HorizontalScrollRow title="Approved Activities" activities={approvedList} category={activeTab} />
                        <HorizontalScrollRow title="Pending Review" activities={pendingList} category={activeTab} />
                        <HorizontalScrollRow title="Rejected" activities={rejectedList} category={activeTab} />
                    </>
                )}

                {/* --- NEW ANNUAL REPORT 1/3 - 2/3 SPLIT VIEW --- */}
                {activeTab === 'Annual Report' && (
                    <div className="report-split" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

                        {/* 1/3 Left Sidebar (Status Card & Print Actions) */}
                        <div className="report-sidebar" style={{ width: '30%', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white' }}>
                                <h3 style={{ margin: '0 0 2rem 0', color: '#312e81', fontSize: '1.1rem', alignSelf: 'flex-start' }}>Overall Approval Status</h3>
                                <ActivityDonutChart
                                    approved={activities.filter(a => a.status === 'Approved').length}
                                    pending={activities.filter(a => a.status === 'Pending').length}
                                    rejected={activities.filter(a => a.status === 'Rejected').length}
                                />
                            </div>

                            {/* Actions replicating the pause/close project from screenshot */}
                            <div className="no-print" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button onClick={handlePrint} className="btn" style={{ flex: 1, padding: '0.75rem', background: 'white', border: '1px solid #cbd5e1', color: '#312e81', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Printer size={18} /> Print Report
                                </button>
                                <button className="btn" style={{ flex: 1, padding: '0.75rem', background: '#312e81', color: 'white', border: 'none', fontWeight: '600' }} onClick={() => alert("Report Exported to PDF")}>
                                    Download PDF
                                </button>
                            </div>
                        </div>

                        {/* 2/3 Right Main Area (Category Bars and Sub-Tables) */}
                        <div className="report-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <CategoryStackedBar
                                categoryName="Teaching"
                                totalScore={metrics.teachingScore}
                                approved={activities.filter(a => a.category === 'Teaching' && a.status === 'Approved').length}
                                pending={activities.filter(a => a.category === 'Teaching' && a.status === 'Pending').length}
                                rejected={activities.filter(a => a.category === 'Teaching' && a.status === 'Rejected').length}
                            />
                            {narrativesList.find(n => n.category === 'Teaching') && (
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                                    <strong style={{ color: '#0f172a' }}>Teaching Narrative:</strong> {narrativesList.find(n => n.category === 'Teaching').narrative_text}
                                </div>
                            )}

                            <CategoryStackedBar
                                categoryName="Admin"
                                totalScore={metrics.adminScore || 0}
                                approved={activities.filter(a => (a.category === 'Admin') && a.status === 'Approved').length}
                                pending={activities.filter(a => (a.category === 'Admin') && a.status === 'Pending').length}
                                rejected={activities.filter(a => (a.category === 'Admin') && a.status === 'Rejected').length}
                            />
                            {narrativesList.find(n => n.category === 'Admin') && (
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                                    <strong style={{ color: '#0f172a' }}>Admin Narrative:</strong> {narrativesList.find(n => n.category === 'Admin').narrative_text}
                                </div>
                            )}

                            <CategoryStackedBar
                                categoryName="Research"
                                totalScore={metrics.researchScore}
                                approved={activities.filter(a => a.category === 'Research' && a.status === 'Approved').length}
                                pending={activities.filter(a => a.category === 'Research' && a.status === 'Pending').length}
                                rejected={activities.filter(a => a.category === 'Research' && a.status === 'Rejected').length}
                            />
                            {narrativesList.find(n => n.category === 'Research') && (
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                                    <strong style={{ color: '#0f172a' }}>Research Narrative:</strong> {narrativesList.find(n => n.category === 'Research').narrative_text}
                                </div>
                            )}

                            {/* Detailed Tabular Log mapping to screenshot 4 detail view */}
                            <div className="card" style={{ marginTop: '2rem' }}>
                                <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Annual Activity Log Detail</h3>
                                <div className="table-container">
                                    <table style={{ fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr>
                                                <th>Date submitted</th>
                                                <th>Activity Title</th>
                                                <th>Category</th>
                                                <th>Status</th>
                                                <th>Points</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activities.length > 0 ? activities.map(a => (
                                                <tr key={a.id}>
                                                    <td>{new Date(a.submitted_at).toLocaleDateString()}</td>
                                                    <td style={{ fontWeight: '500', color: '#312e81' }}>{a.title}</td>
                                                    <td>{a.category}</td>
                                                    <td>
                                                        <span style={{
                                                            color: a.status === 'Approved' ? '#10b981' : a.status === 'Rejected' ? '#ef4444' : '#64748b'
                                                        }}>{a.status}</span>
                                                    </td>
                                                    <td style={{ fontWeight: '600' }}>{a.assigned_score || '-'}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="5">No activities logged yet for this academic year.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </main>

            {/* Main Content Area styling ends before right sidebar */}

            {/* Right Instructions / Instructions Sidebar (Visible on Desktop except when Print layout triggers) */}
            {activeTab !== 'Annual Report' && activeTab !== 'Profile' && (
                <aside className="no-print" style={{ width: '300px', background: '#f8fafc', padding: '2rem', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Summary */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                            <span style={{ fontSize: '0.8rem' }}>▼</span> Summary
                        </h3>
                        <div style={{ fontSize: '0.875rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <p style={{ margin: 0 }}>Approved: {approvedList.length} activities</p>
                            <p style={{ margin: 0 }}>Pending: {pendingList.length} activities</p>
                            <p style={{ margin: 0 }}>Rejected: {rejectedList.length} activities</p>

                            <div style={{ height: '1px', background: '#e2e8f0', margin: '0.5rem 0' }}></div>

                            <p style={{ margin: 0, fontWeight: 'bold' }}>Total: {filteredActivities.length} activities</p>
                        </div>
                    </div>

                    {/* Narrative preview generic helper */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                            <span style={{ fontSize: '0.8rem' }}>▼</span> Help
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Make sure you save your narrative updates for this section before generating your Annual Report.</p>
                    </div>
                </aside>
            )}
        </div>
    );
};

export default FacultyDashboard;
