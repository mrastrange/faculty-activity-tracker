import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Download, FileText, Printer, UserRound, X } from 'lucide-react';
import api from '../services/api';
import { ActivityDonutChart, CategoryStackedBar } from '../components/VisualCharts';

const SCORE_CAPS = {
    Teaching: 100,
    Service: 30,
    Research: 100
};

const normalizeCategory = (category) => (category === 'Co-curricular' ? 'Service' : category);
const formatCategory = (category) => (category === 'Service' ? 'Co-curricular / Service' : category);

const cardStyle = {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '1rem',
    boxShadow: '0 6px 24px rgba(15, 23, 42, 0.05)'
};

const ProfessorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    const metrics = useMemo(() => {
        const approvedActivities = activities.filter((activity) => activity.status === 'Approved');
        const teachingScore = Math.min(
            approvedActivities
                .filter((activity) => activity.category === 'Teaching')
                .reduce((sum, activity) => sum + (parseFloat(activity.assigned_score) || 0), 0),
            SCORE_CAPS.Teaching
        );
        const serviceScore = Math.min(
            approvedActivities
                .filter((activity) => activity.category === 'Service')
                .reduce((sum, activity) => sum + (parseFloat(activity.assigned_score) || 0), 0),
            SCORE_CAPS.Service
        );
        const researchScore = Math.min(
            approvedActivities
                .filter((activity) => activity.category === 'Research')
                .reduce((sum, activity) => sum + (parseFloat(activity.assigned_score) || 0), 0),
            SCORE_CAPS.Research
        );

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

    const pendingActivities = activities.filter((activity) => activity.status === 'Pending');
    const recentActivities = [...activities]
        .sort((a, b) => new Date(b.date_of_activity || b.submitted_at) - new Date(a.date_of_activity || a.submitted_at))
        .slice(0, 8);

    const exportFacultyReport = () => {
        if (!professor) {
            alert('Faculty member not found');
            return;
        }

        const rows = [
            ['Faculty Report'],
            [],
            ['Faculty Name', `${professor.first_name} ${professor.last_name}`],
            ['Email', professor.email || ''],
            ['Designation', professor.designation || ''],
            ['Department ID', professor.department_id || ''],
            ['Verified', professor.is_verified ? 'Yes' : 'No'],
            [],
            ['Score Summary'],
            ['Teaching Score', metrics.teachingScore],
            ['Co-curricular / Service Score', metrics.serviceScore],
            ['Research Score', metrics.researchScore],
            ['Total API Score', metrics.totalScore],
            [],
            ['Narratives'],
            ['Teaching', categoryNarratives.Teaching || ''],
            ['Co-curricular / Service', categoryNarratives.Service || ''],
            ['Research', categoryNarratives.Research || ''],
            [],
            ['Submission Log'],
            ['Date', 'Title', 'Category', 'Semester', 'Status', 'Suggested Score', 'Assigned Score', 'Description', 'Proof']
        ];

        activities.forEach((activity) => {
            rows.push([
                new Date(activity.date_of_activity || activity.submitted_at).toLocaleDateString(),
                activity.title || '',
                formatCategory(activity.category),
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

    if (loading) return <div style={{ padding: '2rem' }}>Loading faculty report...</div>;
    if (!professor) return <div style={{ padding: '2rem' }}>Faculty member not found.</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
            <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <section style={{ ...cardStyle, padding: '1.5rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                    <div>
                        <button
                            onClick={() => navigate('/')}
                            style={{ background: 'transparent', border: 'none', padding: 0, marginBottom: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: '600' }}
                        >
                            <ArrowLeft size={18} /> Back to user directory
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#e0e7ff', color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UserRound size={26} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: '700' }}>Admin Faculty Report</div>
                                <h1 style={{ margin: '0.25rem 0', fontSize: '2rem', color: '#0f172a' }}>{professor.first_name} {professor.last_name}</h1>
                                <div style={{ color: '#475569' }}>{professor.designation || 'Faculty Member'} | {professor.email}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button onClick={() => window.print()} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #cbd5e1' }}>
                            <Printer size={18} /> Print
                        </button>
                        <button onClick={exportFacultyReport} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Download size={18} /> Export CSV
                        </button>
                    </div>
                </section>

                <section style={{ display: 'grid', gridTemplateColumns: '2.1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ ...cardStyle, padding: '1.5rem 1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: '700' }}>Faculty Snapshot</div>
                                <h2 style={{ margin: '0.35rem 0 0', color: '#0f172a' }}>Documentation summary</h2>
                            </div>
                            <div style={{ padding: '0.4rem 0.75rem', borderRadius: '999px', background: professor.is_verified ? '#dcfce7' : '#fef3c7', color: professor.is_verified ? '#166534' : '#92400e', fontWeight: '700', fontSize: '0.85rem' }}>
                                {professor.is_verified ? 'Verified' : 'Pending setup'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <div style={{ background: '#fff7ed', borderRadius: '1rem', padding: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: '700', textTransform: 'uppercase' }}>Teaching</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#c2410c', marginTop: '0.4rem' }}>{metrics.teachingScore}</div>
                                <div style={{ color: '#9a3412', fontSize: '0.85rem' }}>Cap 100</div>
                            </div>
                            <div style={{ background: '#eff6ff', borderRadius: '1rem', padding: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: '700', textTransform: 'uppercase' }}>Co-curricular</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1d4ed8', marginTop: '0.4rem' }}>{metrics.serviceScore}</div>
                                <div style={{ color: '#1d4ed8', fontSize: '0.85rem' }}>Cap 30</div>
                            </div>
                            <div style={{ background: '#f5f3ff', borderRadius: '1rem', padding: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#6d28d9', fontWeight: '700', textTransform: 'uppercase' }}>Research</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#6d28d9', marginTop: '0.4rem' }}>{metrics.researchScore}</div>
                                <div style={{ color: '#6d28d9', fontSize: '0.85rem' }}>Cap 100</div>
                            </div>
                            <div style={{ background: '#0f172a', borderRadius: '1rem', padding: '1rem', color: 'white' }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: '700', textTransform: 'uppercase' }}>Total API</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.4rem' }}>{metrics.totalScore}</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Approved only</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ background: '#f8fafc', borderRadius: '0.9rem', padding: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Department ID</div>
                                <div style={{ color: '#0f172a', marginTop: '0.35rem', fontWeight: '700' }}>{professor.department_id || 'Not assigned'}</div>
                            </div>
                            <div style={{ background: '#f8fafc', borderRadius: '0.9rem', padding: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total submissions</div>
                                <div style={{ color: '#0f172a', marginTop: '0.35rem', fontWeight: '700' }}>{activities.length}</div>
                            </div>
                            <div style={{ background: '#f8fafc', borderRadius: '0.9rem', padding: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Pending review</div>
                                <div style={{ color: '#0f172a', marginTop: '0.35rem', fontWeight: '700' }}>{metrics.pending}</div>
                            </div>
                            <div style={{ background: '#f8fafc', borderRadius: '0.9rem', padding: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Rejected</div>
                                <div style={{ color: '#0f172a', marginTop: '0.35rem', fontWeight: '700' }}>{metrics.rejected}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: '700' }}>Approval status</div>
                            <h2 style={{ margin: '0.35rem 0 0', color: '#0f172a' }}>Review overview</h2>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0 1rem' }}>
                            <ActivityDonutChart approved={metrics.approved} pending={metrics.pending} rejected={metrics.rejected} />
                        </div>
                        <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1rem', color: '#475569', lineHeight: 1.7 }}>
                            <div>CSV export includes profile summary, narratives, and the full submission register.</div>
                            <div>Only approved activities contribute to score totals.</div>
                        </div>
                    </div>
                </section>

                <section style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
                    <div style={{ ...cardStyle, padding: '1.5rem 1.75rem' }}>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: '700' }}>Category breakdown</div>
                        <h2 style={{ margin: '0.35rem 0 1.25rem', color: '#0f172a' }}>Score distribution</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <CategoryStackedBar
                                categoryName="Teaching"
                                totalScore={metrics.teachingScore}
                                approved={activities.filter((activity) => activity.category === 'Teaching' && activity.status === 'Approved').length}
                                pending={activities.filter((activity) => activity.category === 'Teaching' && activity.status === 'Pending').length}
                                rejected={activities.filter((activity) => activity.category === 'Teaching' && activity.status === 'Rejected').length}
                            />
                            <CategoryStackedBar
                                categoryName="Co-curricular / Service"
                                totalScore={metrics.serviceScore}
                                approved={activities.filter((activity) => activity.category === 'Service' && activity.status === 'Approved').length}
                                pending={activities.filter((activity) => activity.category === 'Service' && activity.status === 'Pending').length}
                                rejected={activities.filter((activity) => activity.category === 'Service' && activity.status === 'Rejected').length}
                            />
                            <CategoryStackedBar
                                categoryName="Research"
                                totalScore={metrics.researchScore}
                                approved={activities.filter((activity) => activity.category === 'Research' && activity.status === 'Approved').length}
                                pending={activities.filter((activity) => activity.category === 'Research' && activity.status === 'Pending').length}
                                rejected={activities.filter((activity) => activity.category === 'Research' && activity.status === 'Rejected').length}
                            />
                        </div>
                    </div>

                    <div style={{ ...cardStyle, padding: '1.5rem 1.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            <FileText size={16} /> Narrative extracts
                        </div>
                        <h2 style={{ margin: '0.35rem 0 1.25rem', color: '#0f172a' }}>Faculty self-report</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                ['Teaching', categoryNarratives.Teaching],
                                ['Co-curricular / Service', categoryNarratives.Service],
                                ['Research', categoryNarratives.Research]
                            ].map(([label, text]) => (
                                <div key={label} style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.45rem' }}>{label}</div>
                                    <div style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.7 }}>
                                        {text || 'No narrative submitted for this section.'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section style={{ ...cardStyle, padding: '1.5rem 1.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: '700' }}>Pending review queue</div>
                            <h2 style={{ margin: '0.35rem 0 0', color: '#0f172a' }}>Items requiring admin action</h2>
                        </div>
                        <div style={{ color: '#64748b', fontWeight: '700' }}>{pendingActivities.length} pending</div>
                    </div>

                    <div className="table-container">
                        <table style={{ fontSize: '0.92rem' }}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Suggested</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingActivities.length > 0 ? pendingActivities.map((activity) => (
                                    <tr key={activity.id}>
                                        <td>{new Date(activity.date_of_activity || activity.submitted_at).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: '600', color: '#0f172a' }}>{activity.title}</td>
                                        <td>{formatCategory(activity.category)}</td>
                                        <td>{activity.suggested_score || 0}</td>
                                        <td><span style={{ color: '#b45309', fontWeight: '700' }}>{activity.status}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleReview(activity.id, 'Approved')} className="btn" style={{ background: '#dcfce7', color: '#166534', padding: '0.35rem 0.75rem', border: '1px solid #bbf7d0' }}>
                                                    <Check size={14} style={{ display: 'inline', marginRight: '4px' }} /> Approve
                                                </button>
                                                <button onClick={() => handleReview(activity.id, 'Rejected')} className="btn" style={{ background: 'white', color: '#ef4444', padding: '0.35rem 0.75rem', border: '1px solid #fecaca' }}>
                                                    <X size={14} style={{ display: 'inline', marginRight: '4px' }} /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6">No pending submissions for this faculty member.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section style={{ ...cardStyle, padding: '1.5rem 1.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: '700' }}>Submission register</div>
                            <h2 style={{ margin: '0.35rem 0 0', color: '#0f172a' }}>Recent documented submissions</h2>
                        </div>
                        <div style={{ color: '#64748b', fontWeight: '700' }}>{activities.length} total</div>
                    </div>

                    <div className="table-container">
                        <table style={{ fontSize: '0.92rem' }}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Assigned</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivities.length > 0 ? recentActivities.map((activity) => (
                                    <tr key={activity.id}>
                                        <td>{new Date(activity.date_of_activity || activity.submitted_at).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: '600', color: '#0f172a' }}>{activity.title}</td>
                                        <td>{formatCategory(activity.category)}</td>
                                        <td>
                                            <span style={{ color: activity.status === 'Approved' ? '#166534' : activity.status === 'Rejected' ? '#b91c1c' : '#b45309', fontWeight: '700' }}>
                                                {activity.status}
                                            </span>
                                        </td>
                                        <td>{activity.status === 'Approved' ? activity.assigned_score || 0 : '-'}</td>
                                        <td style={{ color: '#475569', maxWidth: '420px' }}>{activity.description || 'No description provided.'}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6">No submissions found for this faculty member.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfessorDetail;
