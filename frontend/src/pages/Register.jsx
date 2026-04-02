import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Briefcase } from 'lucide-react';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsSubmitting(true);
        try {
            const res = await api.post('/auth/register', formData);
            setSuccessMsg(res.data.message || 'Account created successfully! Check your email for the OTP.');
            setShowOTP(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsVerifying(true);
        try {
            const res = await api.post('/auth/verify-otp', { email: formData.email, otp });
            localStorage.setItem('token', res.data.token);
            window.location.replace('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Invalid OTP.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card" style={{ maxWidth: '500px' }}>
                <div className="login-header">
                    <h1>Faculty API Tracker</h1>
                    <p>Create a new account</p>
                </div>

                {error && <div className="alert-error">{error}</div>}
                {successMsg && <div className="alert-success" style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{successMsg}</div>}

                {!showOTP ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="first_name">First Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                                    <input id="first_name" type="text" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="John" value={formData.first_name} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="last_name">Last Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                                    <input id="last_name" type="text" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Doe" value={formData.last_name} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                                <input id="email" type="email" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="faculty@college.edu" value={formData.email} onChange={handleChange} required />
                            </div>
                        </div>


                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                                <input id="password" type="password" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="••••••••" value={formData.password} onChange={handleChange} required minLength="6" />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
                            <Link to="/faculty-login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>Sign In here</Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="otp">Enter 6-digit OTP</label>
                            <input
                                id="otp"
                                type="text"
                                maxLength="6"
                                className="form-input"
                                style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem' }}
                                placeholder="------"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                An OTP was sent to <strong>{formData.email}</strong>
                            </p>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={isVerifying}>
                            {isVerifying ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Register;
