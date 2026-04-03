import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Check, X, ArrowLeft } from 'lucide-react';

const SCORE_CAPS = {
    Teaching: 100,
    Service: 30,
    Research: 100
};

const normalizeCategory = (category) => (category === 'Co-curricular' ? 'Service' : category);

const ActivityReviewCard = ({ activity, onReview }) => (
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
        gap: '0.55rem'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
            <span>{new Date(activity.date_of_activity || activity.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className={`badge badge-${activity.status.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>{activity.status}</span>
        </div>
        <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={activity.title}>
            {activity.title}
        </h4>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{activity.category === 'Service' ? 'Co-curricular / Service' : activity.category}</div>
        <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={activity.description}>
            {activity.description}
        </p>
        <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '600' }}>
            Score: {activity.status === 'Approved' ? activity.assigned_score || 0 : activity.suggested_score || 0}
        </div>
        {activity.status === 'Pending' && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button onClick={() => onReview(activity.id, 'Approved')} style={{ flex: 1, padding: '0.45rem 0.6rem', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '600' }}>
                    <Check size={14} /> Approve
                </button>
                <button onClick={() => onReview(activity.id, 'Rejected')} style={{ flex: 1, padding: '0.45rem 0.6rem', background: 'white', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '600' }}>
                    <X size={14} /> Reject
                </button>
            </div>
        )}
    </div>
);

const ActivitySection = ({ title, activities, onReview }) => (
    <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: '500', margin: 0, whiteSpace: 'nowrap' }}>{title}</h3>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{activities.length} items</span>
        </div>
        {activities.length === 0 ? (
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', color: '#94a3b8' }}>
                No activities submitted.
            </div>
        ) : (
            <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', padding: '0.5rem 0.5rem', scrollbarWidth: 'none' }}>
                {activities.map((activity) => (
                    <ActivityReviewCard key={activity.id} activity={activity} onReview={onReview} />
                ))}
            </div>
        )}
    </div>
);

const ProfessorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [professor, setProfessor] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const usersRes = await api.get('/auth/all');
            const foundUser = usersRes.data.find((u) => u.id === parseInt(id, 10));
            setProfessor(foundUser);

            const activitiesRes = await api.get('/activities/all');
            const professorActivities = activitiesRes.data
                .filter((a) => a.faculty_id === parseInt(id, 10))
                .map((a) => ({ ...a, category: normalizeCategory(a.category) }));
            setActivities(professorActivities);
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
            await api.put(`/activities/${activityId}/review`, { status, review_comments: '', assigned_score });
            fetchData();
        } catch (error) {
            alert('Failed to submit review');
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Professor Details...</div>;
    if (!professor) return <div style={{ padding: '2rem' }}>Professor not found.</div>;

    const teachingActivities = activities.filter((a) => a.category === 'Teaching');
    const researchActivities = activities.filter((a) => a.category === 'Research');
    const serviceActivities = activities.filter((a) => a.category === 'Service');
    const approvedActivities = activities.filter((a) => a.status === 'Approved');

    const teachingScore = Math.min(approvedActivities.filter((a) => a.category === 'Teaching').reduce((sum, a) => sum + (parseFloat(a.assigned_score) || 0), 0), SCORE_CAPS.Teaching);
    const researchScore = Math.min(approvedActivities.filter((a) => a.category === 'Research').reduce((sum, a) => sum + (parseFloat(a.assigned_score) || 0), 0), SCORE_CAPS.Research);
    const serviceScore = Math.min(approvedActivities.filter((a) => a.category === 'Service').reduce((sum, a) => sum + (parseFloat(a.assigned_score) || 0), 0), SCORE_CAPS.Service);
    const totalScore = teachingScore + researchScore + serviceScore;

    return (
        <div className="app-container" style={{ display: 'flex', background: '#fff' }}>
            <aside style={{ width: '250px', padding: '2rem 0', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0' }}>
                <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
                    <img src="/img/ssn_logo.png" alt="SSN Logo" style={{ height: '40px', width: 'auto' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                </div>
                <div style={{ padding: '0 2rem', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.7 }}>
                    <div>Teaching cap: 100</div>
                    <div>Co-curricular / Service cap: 30</div>
                    <div>Research cap: 100</div>
                    <div style={{ marginTop: '1rem' }}>Only approved activities contribute to score.</div>
                </div>
            </aside>

            <main style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto', background: '#fafafa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '2rem', color: '#0f172a', margin: 0, fontWeight: 'bold' }}>{professor.first_name} {professor.last_name}</h1>
                        <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>{professor.designation || 'Faculty Member'}</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="card metric-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Teaching Score</div>
                        <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#f2722b', marginTop: '0.5rem' }}>{teachingScore}</div>
                    </div>
                    <div className="card metric-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Co-curricular Score</div>
                        <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0ea5e9', marginTop: '0.5rem' }}>{serviceScore}</div>
                    </div>
                    <div className="card metric-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Research Score</div>
                        <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#8b5cf6', marginTop: '0.5rem' }}>{researchScore}</div>
                    </div>
                    <div className="card metric-card" style={{ background: '#312e81', color: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #312e81' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.9 }}>Total API Score</div>
                        <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'white', marginTop: '0.5rem' }}>{totalScore}</div>
                    </div>
                </div>

                <ActivitySection title="Teaching Activities" activities={teachingActivities} onReview={handleReview} />
                <ActivitySection title="Research Activities" activities={researchActivities} onReview={handleReview} />
                <ActivitySection title="Co-curricular & Service Activities" activities={serviceActivities} onReview={handleReview} />
            </main>
        </div>
    );
};

export default ProfessorDetail;
