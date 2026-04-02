import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, UploadCloud } from 'lucide-react';

const ActivitySubmit = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const selectedActivity = location.state?.viewActivity || location.state?.cloneActivity || null;
    const isViewMode = Boolean(location.state?.viewActivity);
    const isRejectedActivity = selectedActivity?.status === 'Rejected';
    const displayCategory = selectedActivity?.category === 'Service' ? 'Co-curricular' : selectedActivity?.category;
    const initialCategory = displayCategory || 'Teaching';
    const initialActivityType = initialCategory === 'Co-curricular' ? 'mentoring' : initialCategory === 'Research' ? 'journal_papers' : 'lectures';

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

    const UGC_GUIDELINES = {
        'Teaching': [
            { id: 'lectures', label: 'Lectures delivered', points: 1 },
            { id: 'tutorials', label: 'Tutorials or practical sessions', points: 1 },
            { id: 'course_prep', label: 'Course preparation/material dev', points: 2 },
            { id: 'learning_methodology', label: 'Innovative teaching methods', points: 5 },
            { id: 'exam_duties', label: 'Examination duties', points: 3 }
        ],
        'Co-curricular': [
            { id: 'mentoring', label: 'Student mentoring or advising', points: 5 },
            { id: 'committees', label: 'Participation in departmental committees', points: 2 },
            { id: 'workshops', label: 'Organizing workshops or seminars', points: 10 },
            { id: 'professional_dev', label: 'Professional development programs', points: 5 }
        ],
        'Research': [
            { id: 'journal_papers', label: 'Journal publications', points: 8 },
            { id: 'conference_papers', label: 'Conference papers presented', points: 5 },
            { id: 'books', label: 'Books or book chapters published', points: 20 },
            { id: 'projects', label: 'Research projects handled', points: 15 },
            { id: 'supervision', label: 'PhD or PG student supervision', points: 10 }
        ]
    };

    const selectedUgcItem = UGC_GUIDELINES[formData.category]?.find(item => item.id === formData.activityType);
    const suggestedScore = selectedUgcItem ? selectedUgcItem.points * formData.quantity : 0;
    const isReadOnly = isViewMode && !isEditingRejected;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'category') {
            const defaultType = UGC_GUIDELINES[value][0].id;
            setFormData({ ...formData, category: value, activityType: defaultType, quantity: 1 });
        } else {
            setFormData({ ...formData, [name]: value });
        }
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
            data.append('significance', 'Minor'); // Defaulting since weight was removed from UI
            data.append('semester', formData.semester);
            data.append('description', formData.description);
            data.append('quantity', formData.quantity);
            data.append('suggested_score', suggestedScore);
            // Send proof_link explicitly
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
            <div style={{ maxWidth: '1000px', width: '100%', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

                {/* Left Side: Form */}
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
                            <select
                                id="category"
                                name="category"
                                className="form-input"
                                value={formData.category}
                                onChange={handleInputChange}
                                disabled={isReadOnly}
                                style={{ maxWidth: '250px' }}
                            >
                                <option value="Teaching">Teaching</option>
                                <option value="Co-curricular">Co-curricular / Admin</option>
                                <option value="Research">Research & Academic</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }} htmlFor="activityType">Activity Type:</label>
                            <select
                                id="activityType"
                                name="activityType"
                                className="form-input"
                                value={formData.activityType}
                                onChange={handleInputChange}
                                disabled={isReadOnly}
                                style={{ maxWidth: '400px' }}
                            >
                                {UGC_GUIDELINES[formData.category === 'Co-curricular / Admin' ? 'Co-curricular' : formData.category === 'Research & Academic' ? 'Research' : formData.category]?.map(item => (
                                    <option key={item.id} value={item.id}>{item.label} (x{item.points} pts)</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }} htmlFor="quantity">Quantity (Multiplier):</label>
                            <input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min="1"
                                required
                                className="form-input"
                                value={formData.quantity}
                                onChange={handleQuantityChange}
                                disabled={isReadOnly}
                                style={{ maxWidth: '100px' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }} htmlFor="title">Name:</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                required
                                className="form-input"
                                placeholder="Created a new XR class"
                                value={formData.title}
                                onChange={handleInputChange}
                                readOnly={isReadOnly}
                                style={{ maxWidth: '400px' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }} htmlFor="semester">Semester:</label>
                            <input
                                id="semester"
                                name="semester"
                                type="text"
                                className="form-input"
                                placeholder="e.g. Fall 2026, Spring 2026"
                                value={formData.semester}
                                onChange={handleInputChange}
                                readOnly={isReadOnly}
                                style={{ maxWidth: '400px' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }} htmlFor="description">Description:</label>
                            <textarea
                                id="description"
                                name="description"
                                rows="8"
                                className="form-input"
                                value={formData.description}
                                onChange={handleInputChange}
                                readOnly={isReadOnly}
                                placeholder="- Conducted research..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }} htmlFor="proofLink">Link to Proof</label>
                            <input
                                id="proofLink"
                                name="proofLink"
                                type="url"
                                className="form-input"
                                placeholder="https://drive.google.com/..."
                                value={formData.proofLink}
                                onChange={handleInputChange}
                                readOnly={isReadOnly}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                            <button type="button" className="btn" style={{ border: '1px solid #cbd5e1', background: 'white' }} onClick={() => navigate('/')}>
                                Back
                            </button>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {isViewMode && isRejectedActivity && !isEditingRejected && (
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{ background: '#b91c1c', color: 'white', border: 'none', padding: '0.75rem 1.5rem' }}
                                        onClick={() => setIsEditingRejected(true)}
                                    >
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


            </div>
        </div>
    );
};

export default ActivitySubmit;
