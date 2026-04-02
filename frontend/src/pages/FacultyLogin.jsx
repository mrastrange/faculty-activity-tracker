import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Key } from 'lucide-react';
import api from '../services/api';

const FacultyLogin = () => {
    const { login } = useContext(AuthContext);

    // UI Stages: 'email', 'password', 'otp', 'setup-password'
    const [stage, setStage] = useState('email');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleCheckEmail = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsSubmitting(true);
        try {
            const res = await api.post('/auth/check-email', { email });
            if (res.data.isFirstTime) {
                setStage('otp');
                setMessage(res.data.message || 'OTP sent to your email.');
            } else {
                setStage('password');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify email.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            if (err.response?.data?.isVerified === false) {
                setStage('otp');
                setError(err.response.data.message);
            } else {
                setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        // We do a soft validation here. Real validation happens when they submit setupPassword, 
        // to save API calls. Alternatively, we could verify OTP first, but let's just move to password.
        if (otp.length === 6) {
            setStage('setup-password');
            setMessage('OTP accepted. Create your permanent password.');
        } else {
            setError('Please enter a valid 6-digit OTP.');
        }
    };

    const handleSetupPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match.');
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/auth/setup-password', { email, otp, password });
            localStorage.setItem('token', res.data.token);
            window.location.replace('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to setup password. Invalid OTP?');
            // If OTP was invalid, send them back
            if (err.response?.status === 400 && err.response?.data?.message.includes('OTP')) {
                setStage('otp');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <img src="/img/ssn_logo.png" alt="SSN Logo" style={{ height: '60px', width: 'auto', marginBottom: '1rem', display: 'block', margin: '0 auto' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                    <h1>Faculty Portal</h1>
                </div>

                {error && <div className="alert-error">{error}</div>}
                {message && !error && <div className="alert-success" style={{ background: '#ecfdf5', color: '#047857', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #a7f3d0' }}>{message}</div>}

                {/* STAGE 1: EMAIL */}
                {stage === 'email' && (
                    <form onSubmit={handleCheckEmail}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    id="email"
                                    type="email"
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="professor@college.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                            {isSubmitting ? 'Checking...' : 'Continue'}
                        </button>
                    </form>
                )}

                {/* STAGE 2: OTP */}
                {stage === 'otp' && (
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
                                Sent to <strong>{email}</strong>
                            </p>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">
                            Verify OTP
                        </button>

                        <button
                            type="button"
                            className="btn btn-block"
                            style={{ marginTop: '1rem', background: 'transparent', color: 'var(--text-muted)' }}
                            onClick={() => { setStage('email'); setError(''); setMessage(''); }}
                        >
                            Change Email
                        </button>
                    </form>
                )}

                {/* STAGE 3: LOGIN PASSWORD */}
                {stage === 'password' && (
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email_locked">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    id="email_locked"
                                    type="email"
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem', background: '#f1f5f9', color: '#64748b' }}
                                    value={email}
                                    readOnly
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    id="password"
                                    type="password"
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                            {isSubmitting ? 'Signing in...' : 'Sign In'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-block"
                            style={{ marginTop: '1rem', background: 'transparent', color: 'var(--text-muted)' }}
                            onClick={() => { setStage('email'); setError(''); setPassword(''); }}
                        >
                            Back
                        </button>
                    </form>
                )}

                {/* STAGE 4: SETUP PASSWORD */}
                {stage === 'setup-password' && (
                    <form onSubmit={handleSetupPassword}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="new_password">Create Permanent Password</label>
                            <div style={{ position: 'relative' }}>
                                <Key size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    id="new_password"
                                    type="password"
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength="6"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="confirm_password">Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                                <input
                                    id="confirm_password"
                                    type="password"
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength="6"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Set Password & Sign In'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-block"
                            style={{ marginTop: '1rem', background: 'transparent', color: 'var(--text-muted)' }}
                            onClick={() => { setStage('otp'); setError(''); setMessage(''); }}
                        >
                            Back to OTP
                        </button>
                    </form>
                )}


                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>
                    <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default FacultyLogin;
