import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle, Download, Printer, X } from 'lucide-react';
import api from '../services/api';
import { ActivityDonutChart, CategoryStackedBar } from '../components/VisualCharts';

const SCORE_CAPS = {
    Teaching: 100,
    Service: 30,
    Research: 100
};

const normalizeCategory = (category) => (category === 'Co-curricular' ? 'Service' : category);

const ActivityCard = ({ activity }) => {
    const categoryLabel = activity.category === 'Service' ? 'Co-curricular / Service' : activity.category;

    return (
        <div
            style={{
                minWidth: '250px',
                maxWidth: '250px',
                padding: '1.25rem',
                background: 'white',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                <span>{new Date(activity.date_of_activity || activity.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                {categoryLabel}
            </div>
        </div>
    );
};

const HorizontalScrollRow = ({ title, activities }) => (
    <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: '500', margin: 0, whiteSpace: 'nowrap' }}>{title}</h3>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{activities.length} items</span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', padding: '0.5rem 0.5rem', scrollbarWidth: 'none' }}>
            {activities.length > 0 ? (
                activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)
            ) : (
                <div style={{ padding: '1.25rem', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '0.75rem', color: '#64748b', minWidth: '250px' }}>
                    No activities in this category yet.
                </div>
            )}
        </div>
    </div>
);

const ProfileView = ({ professor }) => {
    const initials = professor ? `${professor.first_name?.[0] || ''}${professor.last_name?.[0] || ''}`.toUpperCase() : '';

    return (
        <div style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f2722b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', marginRight: '2rem' }}>
                    {initials}
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a' }}>{professor?.first_name} {professor?.last_name}</h2>
                    <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '1.1rem' }}>{professor?.designation || 'Faculty Member'}</p>
                </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>Academic Information</h3>
                <div style={{ display: 'flex', gap: '3rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Designation / Track</label>
                        <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a' }}>
                            {professor?.designation || 'Not Specified'}
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Qualification</label>
                        <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a' }}>
                            {professor?.qualification || 'Not Specified'}
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>Contact Information</h3>
                <div style={{ display: 'flex', gap: '3rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Email Address</label>
                        <div style={{ padding: '0.75rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#64748b' }}>
                            {professor?.email}
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Department ID</label>
                        <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a' }}>
                            {professor?.department_id || 'Not Assigned'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfessorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Annual Report');
    const [professor, setProfessor] = useState(null);
    const [activities, setActivities] = useState([]);
    const [narratives, setNarratives] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const usersRes = await api.get('/auth/all');
            const foundUser = usersRes.data.find((user) => user.id === parseInt(id, 10));
            setProfessor(foundUser || null);

            const [activitiesRes, narrativesRes] = await Promise.all([
                api.get('/activities/all'),
                api.get(`/narratives/faculty/${id}`)
            ]);

            const professorActivities = activitiesRes.data
                .filter((activity) => activity.faculty_id === parseInt(id, 10))
                .map((activity) => ({ ...activity, category: normalizeCategory(activity.category) }));

            setActivities(professorActivities);
            setNarratives((narrativesRes.data || []).map((narrative) => ({ ...narrative, category: normalizeCategory(narrative.category) })));
        } catch (error) {
            console.error('Error fetching professor data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleReview = async (activityId, status) => {
        const activity = activities.find((item) => item.id === activityId);
        const assigned_score = status === 'Approved' ? (activity?.suggested_score || 0) : 0;

        try {
            await api.put(`/activities/${activityId}/review`, {
                status,
                review_comments: `Reviewed by Admin: ${status}`,
                assigned_score
            });
            fetchData();
        } catch (error) {
            alert('Failed to submit review');
        }
    };

    const exportFacultyReport = () => {
        if (!professor) {
            alert('Faculty member not found');
            return;
        }

        const approvedActivities = activities.filter((activity) => activity.status === 'Approved');
        const scores = {
            teaching: Math.min(approvedActivities.filter((activity) => activity.category === 'Teaching').reduce((sum, activity) => sum + (parseFloat(activity.assigned_score) || 0), 0), SCORE_CAPS.Teaching),
            service: Math.min(approvedActivities.filter((activity) => activity.category === 'Service').reduce((sum, activity) => sum + (parseFloat(activity.assigned_score) || 0), 0), SCORE_CAPS.Service),
            research: Math.min(approvedActivities.filter((activity) => activity.category === 'Research').reduce((sum, activity) => sum + (parseFloat(activity.assigned_score) || 0), 0), SCORE_CAPS.Research)
        };
        const total = scores.teaching + scores.service + scores.research;

        const rows = [
            ['Faculty Name', `${professor.first_name} ${professor.last_name}`],
            ['Email', professor.email || ''],
            ['Designation', professor.designation || ''],
            ['Department ID', professor.department_id || ''],
            ['Teaching Score (Capped)', scores.teaching],
            ['Co-curricular / Service Score (Capped)', scores.service],
            ['Research Score (Capped)', scores.research],
            ['Total API Score', total],
            [],
            ['Category Narratives'],
            ['Teaching Narrative', narratives.find((narrative) => narrative.category === 'Teaching')?.narrative_text || ''],
            ['Co-curricular / Service Narrative', narratives.find((narrative) => narrative.category === 'Service')?.narrative_text || ''],
            ['Research Narrative', narratives.find((narrative) => narrative.category === 'Research')?.narrative_text || ''],
            [],
            ['Submission Log'],
            ['Date', 'Title', 'Category', 'Semester', 'Status', 'Suggested Score', 'Assigned Score', 'Description', 'Proof']
        ];

        activities.forEach((activity) => {
            rows.push([
                new Date(activity.date_of_activity || activity.submitted_at).toLocaleDateString(),
                activity.title || '',
                activity.category === 'Service' ? 'Co-curricular / Service' : activity.category || '',
                activity.semester || '',
                activity.status || '',
                activity.suggested_score || 0,
                activity.assigned_score || 0,
                activity.description || '',
                activity.proof_document_path || ''
            ]);
        });

        const csvContent = rows
            .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `faculty_report_${professor.first_name}_${professor.last_name}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const metrics = useMemo(() => {
        const approvedActivities = activities.filter((activity) => activity.status === 'Approved');
        const teachingScore = Math.min(approvedActivities.filter((activity) => activity.category === 'Teaching').reduce((sum, activity) => sum + (parseFloat(activity.assigned_score) || 0), 0), SCORE_CAPS.Teaching);
        const serviceScore = Math.min(approvedActivities.filter((activity) => activity.category === 'Service').reduce((sum, activity) => sum + (parseFloat(activity.assigned_score) || 0), 0), SCORE_CAPS.Service);
        const researchScore = Math.min(approvedActivities.filter((activity) => activity.category === 'Research').reduce((sum, activity) => sum + (parseFloat(activity.assigned_score) || 0), 0), SCORE_CAPS.Research);

        return {
            teachingScore,
            serviceScore,
            researchScore,
            totalScore: teachingScore + serviceScore + researchScore,
            approved: activities.filter((activity) => activity.status === 'Approved').length,
            pending: activities.filter((activity) => activity.status === 'Pending').length,
            rejected: activities.filter((activity) => activity.status === 'Rejected').length
        };
    }, [activities]);

    const categoryNarratives = {
        Teaching: narratives.find((narrative) => narrative.category === 'Teaching')?.narrative_text,
        Service: narratives.find((narrative) => narrative.category === 'Service')?.narrative_text,
        Research: narratives.find((narrative) => narrative.category === 'Research')?.narrative_text
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading faculty report...</div>;
    if (!professor) return <div style={{ padding: '2rem' }}>Faculty member not found.</div>;

    return (
        <div className="app-container" style={{ display: 'flex', background: '#fff' }}>
            <aside style={{ width: '250px', padding: '2rem 0', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0' }}>
                <div style={{ padding: '0 2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/img/ssn_logo.png" alt="SSN Logo" style={{ height: '40px', width: 'auto' }} onError={(event) => { event.target.onerror = null; event.target.style.display = 'none'; }} />
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{ padding: '0.75rem 2rem', cursor: 'pointer', color: '#64748b', fontWeight: '500', background: 'transparent', border: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <ArrowLeft size={18} /> Back to Admin
                    </button>
                    <div
                        onClick={() => setActiveTab('Profile')}
                        style={{ padding: '0.75rem 2rem', cursor: 'pointer', color: activeTab === 'Profile' ? '#f2722b' : '#64748b', fontWeight: activeTab === 'Profile' ? '600' : '500', background: activeTab === 'Profile' ? '#fff6f0' : 'transparent', borderRight: activeTab === 'Profile' ? '3px solid #f2722b' : 'none' }}
                    >
                        Faculty Profile
                    </div>
                    <div
                        onClick={() => setActiveTab('Annual Report')}
                        style={{ padding: '0.75rem 2rem', cursor: 'pointer', color: activeTab === 'Annual Report' ? '#10b981' : '#64748b', fontWeight: activeTab === 'Annual Report' ? '600' : '500', background: activeTab === 'Annual Report' ? '#ecfdf5' : 'transparent', borderRight: activeTab === 'Annual Report' ? '3px solid #10b981' : 'none' }}
                    >
                        Annual Report
                    </div>
                </nav>

                <div style={{ marginTop: 'auto', padding: '0 2rem', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.7 }}>
                    <div>{professor.email}</div>
                    <div style={{ marginTop: '1rem' }}>Teaching cap: 100</div>
                    <div>Co-curricular / Service cap: 30</div>
                    <div>Research cap: 100</div>
                </div>
            </aside>

            <main style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto', background: '#fafafa' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', color: '#0f172a', margin: 0, fontWeight: 'bold' }}>
                            {activeTab === 'Profile' ? 'Faculty Profile' : `Annual Activity Report (${new Date().getFullYear()})`}
                        </h1>
                        <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>
                            {professor.first_name} {professor.last_name} | {professor.designation || 'Faculty Member'}
                        </p>
                    </div>
                    {activeTab === 'Annual Report' && (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => window.print()} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #cbd5e1' }}>
                                <Printer size={18} /> Print Report
                            </button>
                            <button onClick={exportFacultyReport} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Download size={18} /> Export CSV
                            </button>
                        </div>
                    )}
                </header>

                {activeTab !== 'Profile' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                        <div className="card metric-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teaching Score</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f2722b', marginTop: '0.5rem' }}>{metrics.teachingScore}</div>
                        </div>
                        <div className="card metric-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Co-curricular Score</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0ea5e9', marginTop: '0.5rem' }}>{metrics.serviceScore}</div>
                        </div>
                        <div className="card metric-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Research Score</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#8b5cf6', marginTop: '0.5rem' }}>{metrics.researchScore}</div>
                        </div>
                        <div className="card metric-card print-primary" style={{ background: '#312e81', color: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #312e81' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>Total API Score</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginTop: '0.5rem' }}>{metrics.totalScore}</div>
                        </div>
                    </div>
                )}

                {activeTab === 'Profile' && (
                    <>
                        <ProfileView professor={professor} />
                        <div style={{ marginTop: '3rem' }}>
                            <h2 style={{ fontSize: '1.5rem', margin: '0 0 2rem 0', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>Faculty Activities</h2>
                            <HorizontalScrollRow title="Teaching Activities" activities={activities.filter((activity) => activity.category === 'Teaching')} />
                            <HorizontalScrollRow title="Research Activities" activities={activities.filter((activity) => activity.category === 'Research')} />
                            <HorizontalScrollRow title="Co-curricular & Service Activities" activities={activities.filter((activity) => activity.category === 'Service')} />
                        </div>
                    </>
                )}

                {activeTab === 'Annual Report' && (
                    <div className="report-split" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                        <div className="report-sidebar" style={{ width: '30%', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white' }}>
                                <h3 style={{ margin: '0 0 2rem 0', color: '#312e81', fontSize: '1.1rem', alignSelf: 'flex-start' }}>Overall Approval Status</h3>
                                <ActivityDonutChart approved={metrics.approved} pending={metrics.pending} rejected={metrics.rejected} />
                            </div>

                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1rem' }}>Admin Notes</h3>
                                <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.7 }}>
                                    <div>Only approved activities contribute to the faculty API score.</div>
                                    <div>CSV export includes profile data, narratives, and the full submission log.</div>
                                </div>
                            </div>
                        </div>

                        <div className="report-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <CategoryStackedBar
                                categoryName="Teaching"
                                totalScore={metrics.teachingScore}
                                approved={activities.filter((activity) => activity.category === 'Teaching' && activity.status === 'Approved').length}
                                pending={activities.filter((activity) => activity.category === 'Teaching' && activity.status === 'Pending').length}
                                rejected={activities.filter((activity) => activity.category === 'Teaching' && activity.status === 'Rejected').length}
                            />
                            {categoryNarratives.Teaching && (
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                                    <strong style={{ color: '#0f172a' }}>Teaching Narrative:</strong> {categoryNarratives.Teaching}
                                </div>
                            )}

                            <CategoryStackedBar
                                categoryName="Co-curricular / Service"
                                totalScore={metrics.serviceScore}
                                approved={activities.filter((activity) => activity.category === 'Service' && activity.status === 'Approved').length}
                                pending={activities.filter((activity) => activity.category === 'Service' && activity.status === 'Pending').length}
                                rejected={activities.filter((activity) => activity.category === 'Service' && activity.status === 'Rejected').length}
                            />
                            {categoryNarratives.Service && (
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                                    <strong style={{ color: '#0f172a' }}>Co-curricular Narrative:</strong> {categoryNarratives.Service}
                                </div>
                            )}

                            <CategoryStackedBar
                                categoryName="Research"
                                totalScore={metrics.researchScore}
                                approved={activities.filter((activity) => activity.category === 'Research' && activity.status === 'Approved').length}
                                pending={activities.filter((activity) => activity.category === 'Research' && activity.status === 'Pending').length}
                                rejected={activities.filter((activity) => activity.category === 'Research' && activity.status === 'Rejected').length}
                            />
                            {categoryNarratives.Research && (
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569', marginTop: '-1rem', marginBottom: '1.5rem' }}>
                                    <strong style={{ color: '#0f172a' }}>Research Narrative:</strong> {categoryNarratives.Research}
                                </div>
                            )}

                            <div className="card" style={{ marginTop: '2rem' }}>
                                <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Faculty Submission Log</h3>
                                <div className="table-container">
                                    <table style={{ fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr>
                                                <th>Date submitted</th>
                                                <th>Activity Title</th>
                                                <th>Category</th>
                                                <th>Status</th>
                                                <th>Points</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activities.length > 0 ? activities.map((activity) => (
                                                <tr key={activity.id}>
                                                    <td>{new Date(activity.date_of_activity || activity.submitted_at).toLocaleDateString()}</td>
                                                    <td style={{ fontWeight: '500', color: '#312e81' }}>{activity.title}</td>
                                                    <td>{activity.category === 'Service' ? 'Co-curricular / Service' : activity.category}</td>
                                                    <td>
                                                        <span style={{ color: activity.status === 'Approved' ? '#10b981' : activity.status === 'Rejected' ? '#ef4444' : '#64748b' }}>
                                                            {activity.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: '600' }}>{activity.status === 'Approved' ? activity.assigned_score || 0 : activity.suggested_score || 0}</td>
                                                    <td>
                                                        {activity.status === 'Pending' ? (
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button onClick={() => handleReview(activity.id, 'Approved')} className="btn" style={{ background: '#dcfce7', color: '#166534', padding: '0.35rem 0.75rem', border: '1px solid #bbf7d0' }}>
                                                                    <Check size={14} style={{ display: 'inline', marginRight: '4px' }} /> Approve
                                                                </button>
                                                                <button onClick={() => handleReview(activity.id, 'Rejected')} className="btn" style={{ background: 'white', color: '#ef4444', padding: '0.35rem 0.75rem', border: '1px solid #fecaca' }}>
                                                                    <X size={14} style={{ display: 'inline', marginRight: '4px' }} /> Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                                <CheckCircle size={14} /> Reviewed
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="6">No submissions found for this faculty member.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProfessorDetail;
