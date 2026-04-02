import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Users, Shield, GraduationCap } from 'lucide-react';

const Landing = () => {
    // If the user lands here, we give them two distinct options
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: '2rem'
        }}>
            <div style={{ maxWidth: '800px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <img src="/img/ssn_logo.png" alt="SSN Logo" style={{ height: '80px', width: 'auto', marginBottom: '1.5rem', display: 'block', margin: '0 auto' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />

                    <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '1rem' }}>Faculty Activity Tracker</h1>
                    <p style={{ fontSize: '1.2rem', color: '#64748b' }}>Select your portal to continue</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* Faculty Card */}
                    <Link to="/faculty-login" style={{ textDecoration: 'none' }}>
                        <div style={{
                            background: 'white',
                            padding: '3rem 2rem',
                            borderRadius: '1rem',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ display: 'inline-flex', background: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                                <Users size={40} />
                            </div>
                            <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>Faculty Portal</h2>
                        </div>
                    </Link>

                    {/* Management Card */}
                    <Link to="/management-login" style={{ textDecoration: 'none' }}>
                        <div style={{
                            background: 'white',
                            padding: '3rem 2rem',
                            borderRadius: '1rem',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center',
                            transition: 'transform 0.2s',
                            cursor: 'pointer',
                            borderTop: '4px solid var(--secondary)'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ display: 'inline-flex', background: 'rgba(242, 114, 43, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--secondary)' }}>
                                <Shield size={40} />
                            </div>
                            <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>Management Desk</h2>
                        </div>
                    </Link>

                </div>
            </div>
        </div>
    );
};

export default Landing;
