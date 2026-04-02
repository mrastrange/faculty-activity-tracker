import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, UploadCloud } from 'lucide-react';

const ActivitySubmit = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        category: 'Teaching',
        activityType: 'lectures',
        significance: 'Minor',
        description: '',
        quantity: 1
    });

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

    // Checkbox states for Semester
    const [semesters, setSemesters] = useState({
        fall2023: false,
        spring2023: false,
        summer2023: false,
        other: false
    });

    const [file, setFile] = useState(null);
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

    const handleCheckboxChange = (e) => {
        setSemesters({ ...semesters, [e.target.name]: e.target.checked });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Compile Semesters into CSV string
            const activeSemesters = [];
            if (semesters.fall2023) activeSemesters.push('Fall 2026');
            if (semesters.spring2023) activeSemesters.push('Spring 2026');
            if (semesters.summer2023) activeSemesters.push('Summer 2026');
            if (semesters.other) activeSemesters.push('Other');

            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('significance', formData.significance);
            data.append('semester', activeSemesters.join(', '));
            data.append('description', formData.description);
            data.append('quantity', formData.quantity);
            data.append('suggested_score', suggestedScore);

            if (file) {
                // If they supplied a file, append it
                data.append('proof_document', file);
            } else {
                // Backend requires something if we use multer generically without `.single` handling optional gracefully? Right now controller checks req.file. Optional logic handles it if multer isn't strict.
                // In my controller rewrite I made it optional!
            }

            await api.post('/activities', data, {
                headers: { 'Content-Type': 'multipart/form-data' } // Works even if file is missing if configured correctly
            });
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
                        <h1 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 'bold' }}>New Activity - {formData.category}</h1>
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
                                style={{ maxWidth: '400px' }}
                            >
                                {UGC_GUIDELINES[formData.category === 'Co-curricular / Admin' ? 'Co-curricular' : formData.category === 'Research & Academic' ? 'Research' : formData.category]?.map(item => (
                                    <option key={item.id} value={item.id}>{item.label} (x{item.points} pts)</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            <div>
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
                                    style={{ maxWidth: '100px' }}
                                />
                            </div>
                            <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0', minWidth: '150px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase' }}>Suggested Score</div>
                                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#15803d' }}>{suggestedScore}</div>
                            </div>
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
                                style={{ maxWidth: '400px' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }} htmlFor="significance">Weight:</label>
                            <select
                                id="significance"
                                name="significance"
                                className="form-input"
                                value={formData.significance}
                                onChange={handleInputChange}
                                style={{ maxWidth: '200px' }}
                            >
                                <option value="Minor">Minor</option>
                                <option value="Significant">Significant</option>
                                <option value="Major">Major</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }}>Semester:</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" name="fall2023" checked={semesters.fall2023} onChange={handleCheckboxChange} style={{ accentColor: '#0ea5e9', transform: 'scale(1.2)' }} />
                                    Fall 2026
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" name="spring2023" checked={semesters.spring2023} onChange={handleCheckboxChange} style={{ accentColor: '#0ea5e9', transform: 'scale(1.2)' }} />
                                    Spring 2026
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" name="summer2023" checked={semesters.summer2023} onChange={handleCheckboxChange} style={{ accentColor: '#0ea5e9', transform: 'scale(1.2)' }} />
                                    Summer 2026
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" name="other" checked={semesters.other} onChange={handleCheckboxChange} style={{ accentColor: '#0ea5e9', transform: 'scale(1.2)' }} />
                                    Other
                                </label>
                            </div>
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
                                placeholder="- Conducted research..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ fontWeight: '600' }}>Proof Document (Optional PDF)</label>
                            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                {file && <span style={{ fontSize: '0.8rem', color: 'green' }}>File attached</span>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                            <button type="button" className="btn" style={{ border: '1px solid #cbd5e1', background: 'white' }} onClick={() => navigate('/')}>
                                Back
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ background: '#b91c1c', border: 'none', padding: '0.75rem 2rem' }} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Side: Instructions Sidebar */}
                <div style={{ width: '300px', background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', alignSelf: 'stretch' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem' }}>▼</span> Instructions
                    </h3>

                    <div style={{ fontSize: '0.875rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.5' }}>
                        <p>For each activity, select a category, insert information about each activity, and provide a concise description that provides context.</p>
                        <p>Each activity should have a weight of <strong>major, significant, or minor.</strong></p>
                        <p>Guidelines are provided but are not strictly enforced in the score calculation.</p>
                        <p>If you would like to make a weight claim that is different than listed, it must be justified in the description.</p>
                        <p>If you would like to make a bonus claim meaning that your work in one category should overflow into another, then justify it in the description.</p>
                        <p>The committee may ask for evidence for extra support and context.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ActivitySubmit;
