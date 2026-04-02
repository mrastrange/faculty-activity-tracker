import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Check, X, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

const CategoryAccordion = ({ title, category, activities, narrative, onReview }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div style={{ marginBottom: '1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
            {/* Header */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', cursor: 'pointer', background: '#f8fafc', borderBottom: isOpen ? '1px solid #e2e8f0' : 'none' }}>
                <span style={{ fontWeight: '500', color: '#0f172a' }}>{title}</span>
                {isOpen ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
            </div>

            {/* Content */}
            {isOpen && (
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Narrative
                        </h4>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', color: narrative ? '#334155' : '#94a3b8', fontSize: '0.95rem', minHeight: '60px' }}>
                            {narrative || 'No narrative'}
                        </div>
                    </div>

                    <div>
                        {activities.length === 0 ? (
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>No activities submitted for {title.toLowerCase()}.</p>
                        ) : (
                            activities.map(activity => (
                                <div key={activity.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: '#0f172a' }}>{activity.title}</h4>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                            <span>{activity.semester || 'Fall 2026'}</span>
                                            <span style={{ fontWeight: '500' }}>Base API Points: {activity.suggested_score}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>{activity.description}</p>
                                        {activity.proof_document_name && (
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        const { data } = await api.get(`/activities/${activity.id}/document`, { responseType: 'blob' });
                                                        const url = window.URL.createObjectURL(new Blob([data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', activity.proof_document_name || 'document.pdf');
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        link.parentNode.removeChild(link);
                                                    } catch (e) { alert("Download failed"); }
                                                }} 
                                                style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe', borderRadius: '0.25rem', cursor: 'pointer' }}
                                            >
                                                Download Evidence
                                            </button>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {activity.status === 'Approved' && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}><Check size={16} /> Approved</span>}
                                        {activity.status === 'Rejected' && <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}><X size={16} /> Rejected</span>}
                                        {activity.status === 'Pending' && (
                                            <>
                                                <button
                                                    onClick={() => onReview(activity.id, 'Approved', activity.suggested_score)}
                                                    style={{ padding: '0.25rem 0.75rem', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                                    <Check size={14} /> Accept ({activity.suggested_score} pts)
                                                </button>
                                                <button
                                                    onClick={() => onReview(activity.id, 'Rejected', 0)}
                                                    style={{ padding: '0.25rem 0.75rem', background: 'white', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '500' }}>
                                                    <X size={14} /> Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ProfessorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [professor, setProfessor] = useState(null);
    const [activities, setActivities] = useState([]);
    const [narratives, setNarratives] = useState([]);
    const [metrics, setMetrics] = useState({ totalScore: 0 });
    const [loading, setLoading] = useState(true);

    const currentYear = new Date().getFullYear().toString();

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all users to find this specific professor's basic details (since we don't have a single user endpoint right now)
            const usersRes = await api.get('/auth/all');
            const foundUser = usersRes.data.find(u => u.id === parseInt(id));
            setProfessor(foundUser);

            // Fetch college activities and filter for this user
            const activitiesRes = await api.get('/activities/all');
            setActivities(activitiesRes.data.filter(a => a.faculty_id === parseInt(id)));

            // Fetch Narratives for this user
            const narrativesRes = await api.get(`/narratives/faculty/${id}`);
            setNarratives(narrativesRes.data);

            const analyticsRes = await api.get('/dashboard/admin/analytics');
            // Mocking pulling specific cached API scores for now if needed, we'll calculate below for fallback.
        } catch (error) {
            console.error("Error fetching professor data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [id]);

    const handleReview = async (activityId, status, suggested_score) => {
        try {
            await api.put(`/activities/${activityId}/review`, { status, review_comments: '', assigned_score: suggested_score });
            // Re-fetch data to update UI and Score
            fetchData();
        } catch (error) {
            alert('Failed to submit review');
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Professor Details...</div>;
    if (!professor) return <div style={{ padding: '2rem' }}>Professor not found.</div>;

    // Derived State
    const teachingAcc = activities.filter(a => a.category === 'Teaching');
    const researchAcc = activities.filter(a => a.category === 'Research');
    const serviceAcc = activities.filter(a => a.category === 'Admin' || a.category === 'Co-curricular' || a.category === 'Service');

    const teachingNarrative = narratives.find(n => n.category === 'Teaching')?.narrative_text;
    const researchNarrative = narratives.find(n => n.category === 'Research')?.narrative_text;
    const serviceNarrative = narratives.find(n => n.category === 'Admin' || n.category === 'Service')?.narrative_text;

    // Derived Rubric API Calculation based on Admin backend rules
    const approvedActivities = activities.filter(a => a.status === 'Approved');
    const teachingSum = approvedActivities.filter(a => a.category === 'Teaching').reduce((acc, a) => acc + (a.assigned_score || 0), 0);
    const researchSum = approvedActivities.filter(a => a.category === 'Research').reduce((acc, a) => acc + (a.assigned_score || 0), 0);
    const adminSum = approvedActivities.filter(a => a.category === 'Admin').reduce((acc, a) => acc + (a.assigned_score || 0), 0);

    const normTeaching = (Math.min(teachingSum, 100) / 100) * 100;
    const normResearch = (Math.min(researchSum, 150) / 150) * 100;
    const normAdmin = (Math.min(adminSum, 50) / 50) * 100;

    const finalScore = (0.40 * normTeaching) + (0.50 * normResearch) + (0.10 * normAdmin);

    return (
        <div style={{ display: 'flex', background: '#fff', minHeight: '100vh', width: '100%' }}>

            {/* Left Content Area */}
            <main style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate('/admin-dashboard')}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: '2rem', color: '#0f172a', margin: 0, fontWeight: 'bold' }}>
                        Professor {professor.first_name} {professor.last_name}
                    </h1>
                    <span style={{ padding: '0.25rem 0.75rem', background: '#e0e7ff', color: '#3730a3', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: '600' }}>
                        {professor.designation || 'TT/T'}
                    </span>
                </div>

                <CategoryAccordion
                    title="Teaching"
                    category="Teaching"
                    activities={teachingAcc}
                    narrative={teachingNarrative}
                    onReview={handleReview}
                />

                <CategoryAccordion
                    title="Research"
                    category="Research"
                    activities={researchAcc}
                    narrative={researchNarrative}
                    onReview={handleReview}
                />

                <CategoryAccordion
                    title="Service"
                    category="Service"
                    activities={serviceAcc}
                    narrative={serviceNarrative}
                    onReview={handleReview}
                />

            </main>

            {/* Right Sidebar - Scoring Rubric */}
            <aside style={{ width: '350px', background: '#fafafa', padding: '2rem', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Teaching Release Block */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1rem' }}>Teaching Release</h4>
                    <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>N/A</p>
                </div>

                {/* Academic Norms Info */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#0f172a', fontSize: '1rem' }}>Academic Performance Index Metric</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>Teaching: (Sum / 100 Cap) * 40%</li>
                        <li>Research: (Sum / 150 Cap) * 50%</li>
                        <li>Admin: (Sum / 50 Cap) * 10%</li>
                    </ul>
                </div>

                {/* Score Breakdown */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '600', marginBottom: '0.5rem' }}>Teaching</div>
                        <div style={{ background: '#e2e8f0', padding: '0.5rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem', color: '#334155' }}>
                            {normTeaching.toFixed(1)}%
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '600', marginBottom: '0.5rem' }}>Research</div>
                        <div style={{ background: '#e2e8f0', padding: '0.5rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem', color: '#334155' }}>
                            {normResearch.toFixed(1)}%
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '600', marginBottom: '0.5rem' }}>Admin</div>
                        <div style={{ background: '#e2e8f0', padding: '0.5rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem', color: '#334155' }}>
                            {normAdmin.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Final Calculated Score */}
                <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1rem' }}>Final Normalized API</h4>
                    <div style={{ background: '#dcfce7', padding: '0.75rem 1rem', borderRadius: '0.5rem', width: 'fit-content', fontWeight: 'bold', fontSize: '1.5rem', color: '#166534' }}>
                        {finalScore.toFixed(2)} / 100
                    </div>
                </div>

            </aside>
        </div>
    );
};

export default ProfessorDetail;
