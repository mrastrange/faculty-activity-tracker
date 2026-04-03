import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft } from 'lucide-react';

const CATEGORY_GUIDELINES = {
    'Teaching': {
        cap: 100,
        quantityLabel: 'Count / Hours / Duties',
        items: [
            { id: 'lectures', label: 'Lectures delivered', points: 1, note: '1 point per hour' },
            { id: 'tutorials', label: 'Tutorials / practical sessions', points: 1, note: '1 point per hour' },
            { id: 'course_prep', label: 'Course material development', points: 5, note: '5 points per course' },
            { id: 'learning_methodology', label: 'Innovative teaching', points: 10, note: '10 points per activity' },
            { id: 'exam_duties', label: 'Exam duty', points: 2, note: '2 points per duty' }
        ]
    },
    'Co-curricular': {
        cap: 30,
        quantityLabel: 'Count / Semesters / Events',
        items: [
            { id: 'mentoring', label: 'Student mentoring', points: 5, note: '5 points per semester' },
            { id: 'committees', label: 'Committee participation', points: 5, note: '5 points per committee' },
            { id: 'workshops', label: 'Organizing workshop', points: 10, note: '10 points per event' },
            { id: 'professional_dev', label: 'FDP participation', points: 5, note: '5 points per program' }
        ]
    },
    'Research': {
        cap: 100,
        quantityLabel: 'Count',
        items: [
            { id: 'journal_papers', label: 'Journal publication', points: 15, note: '15 points each' },
            { id: 'conference_papers', label: 'Conference paper', points: 10, note: '10 points each' },
            { id: 'books', label: 'Book chapter', points: 20, note: '20 points each' },
            { id: 'projects', label: 'Research project', points: 20, note: '20 points each' },
            { id: 'phd_supervision', label: 'PhD supervision', points: 25, note: '25 points each' },
            { id: 'pg_supervision', label: 'PG supervision', points: 10, note: '10 points each' }
        ]
    }
};

const ActivitySubmit = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedActivity = location.state?.viewActivity || location.state?.cloneActivity || null;
    const isViewMode = Boolean(location.state?.viewActivity);
    const isRejectedActivity = selectedActivity?.status === 'Rejected';
    const displayCategory = selectedActivity?.category === 'Service' ? 'Co-curricular' : selectedActivity?.category;
    const initialCategory = displayCategory || 'Teaching';
    const initialActivityType = CATEGORY_GUIDELINES[initialCategory].items[0].id;

    const [formData, setFormData] = useState({
        title: selectedActivity?.title || '',
        category: initialCategory,
        activityType: initialActivityType,
        description: selectedActivity?.description || '',
        quantity: selectedActivity?.quantity || 1,
        semester: selectedActivity?.semester || '',
        proofLink: selectedActivity?.proof_document_path || ''
    });
    const [isEditingRejected, setIsEditingRejected] = useState(!isViewMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const selectedGuideline = CATEGORY_GUIDELINES[formData.category];
    const selectedItem = selectedGuideline.items.find((item) => item.id === formData.activityType);
    const suggestedScore = selectedItem ? selectedItem.points * formData.quantity : 0;
    const isReadOnly = isViewMode && !isEditingRejected;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category') {
            setFormData({
                ...formData,
                category: value,
                activityType: CATEGORY_GUIDELINES[value].items[0].id,
                quantity: 1
            });
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleQuantityChange = (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        setFormData({ ...formData, quantity: val });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('significance', 'Minor');
            data.append('semester', formData.semester);
            data.append('description', formData.description);
            data.append('quantity', formData.quantity);
            data.append('suggested_score', suggestedScore);

            if (formData.proofLink) {
                data.append('proof_link', formData.proofLink);
            }

            if (selectedActivity?.id && isRejectedActivity) {
                await api.put(`/activities/${selectedActivity.id}/resubmit`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/activities', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit activity.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc', padding: '3rem 1rem 5rem 1rem' }}>
            <div style={{ maxWidth: '1100px', width: '100%', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem' }}>
                            <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
                        </Link>
                        <h1 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 'bold' }}>
                            {isViewMode ? 'Activity Details' : 'New Activity'} - {formData.category}
                        </h1>
                        {selectedActivity?.status && (
                            <p style={{ margin: '0.5rem 0 0', color: isRejectedActivity ? '#b91c1c' : '#64748b', fontWeight: '600' }}>
                                Status: {selectedActivity.status}
                            </p>
                        )}
                    </div>

                    {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }} htmlFor="category">Category:</label>
                            <select id="category" name="category" className="form-input" value={formData.category} onChange={handleInputChange} disabled={isReadOnly} style={{ maxWidth: '250px' }}>
                                <option value="Teaching">Teaching</option>
                                <option value="Co-curricular">Co-curricular / Service</option>
                                <option value="Research">Research</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }} htmlFor="activityType">Activity Type:</label>
                            <select id="activityType" name="activityType" className="form-input" value={formData.activityType} onChange={handleInputChange} disabled={isReadOnly} style={{ maxWidth: '420px' }}>
                                {selectedGuideline.items.map((item) => (
                                    <option key={item.id} value={item.id}>{item.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }} htmlFor="quantity">{selectedGuideline.quantityLabel}:</label>
                            <input id="quantity" name="quantity" type="number" min="1" required className="form-input" value={formData.quantity} onChange={handleQuantityChange} disabled={isReadOnly} style={{ maxWidth: '140px' }} />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }} htmlFor="title">Name:</label>
                            <input id="title" name="title" type="text" required className="form-input" placeholder="Enter activity title" value={formData.title} onChange={handleInputChange} readOnly={isReadOnly} style={{ maxWidth: '420px' }} />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }} htmlFor="semester">Semester / Period:</label>
                            <input id="semester" name="semester" type="text" className="form-input" placeholder="e.g. Fall 2026, Semester 1" value={formData.semester} onChange={handleInputChange} readOnly={isReadOnly} style={{ maxWidth: '420px' }} />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }} htmlFor="description">Description:</label>
                            <textarea id="description" name="description" rows="8" className="form-input" value={formData.description} onChange={handleInputChange} readOnly={isReadOnly} placeholder="Describe the activity briefly" />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }} htmlFor="proofLink">Link to Proof</label>
                            <input id="proofLink" name="proofLink" type="url" className="form-input" placeholder="https://drive.google.com/..." value={formData.proofLink} onChange={handleInputChange} readOnly={isReadOnly} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                            <button type="button" className="btn" style={{ border: '1px solid #cbd5e1', background: 'white' }} onClick={() => navigate('/')}>
                                Back
                            </button>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {isViewMode && isRejectedActivity && !isEditingRejected && (
                                    <button type="button" className="btn" style={{ background: '#b91c1c', color: 'white', border: 'none', padding: '0.75rem 1.5rem' }} onClick={() => setIsEditingRejected(true)}>
                                        Modify and Submit Again
                                    </button>
                                )}
                                {(!isViewMode || isEditingRejected) && (
                                    <button type="submit" className="btn btn-primary" style={{ background: '#b91c1c', border: 'none', padding: '0.75rem 2rem' }} disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : selectedActivity?.id && isRejectedActivity ? 'Submit Again' : 'Submit'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <aside style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Instructions</h3>
                        <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                            Category cap: <strong style={{ color: '#0f172a' }}>{selectedGuideline.cap}</strong>
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {selectedGuideline.items.map((item) => (
                                <div key={item.id} style={{ paddingBottom: '0.85rem', borderBottom: '1px solid #e2e8f0' }}>
                                    <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.2rem' }}>{item.label}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.note}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 0.75rem 0', color: '#0f172a' }}>Current Suggestion</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                            Suggested score for this entry: <strong style={{ color: '#0f172a' }}>{suggestedScore}</strong>. Final points are applied only after review.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ActivitySubmit;
