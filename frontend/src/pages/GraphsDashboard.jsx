import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const ScatterCard = ({ title, data }) => (
    <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '1rem', flex: 1, minWidth: '400px' }}>
        <h3 style={{ margin: '0 0 2rem 0', color: '#0f172a', fontSize: '1.25rem' }}>{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="index" name="Professor" axisLine={false} tickLine={false} tick={false} label={{ value: 'Professors', position: 'insideBottom', offset: -10, fill: '#64748b' }} />
                    <YAxis dataKey="score" name="Final Score" domain={[0, 10]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} label={{ value: 'Final Score', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [value, name]} />
                    <Scatter name="Professors" data={data} fill="#f2722b" />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const BarChartCard = ({ title, data, totalProfessors }) => (
    <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '1rem', flex: 1, minWidth: '400px' }}>
        <h3 style={{ margin: '0 0 2rem 0', color: '#0f172a', fontSize: '1.25rem' }}>{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="bucket" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} label={{ value: '# of Activities', position: 'insideBottom', offset: -10, fill: '#64748b' }} />
                    <YAxis domain={[0, 120]} ticks={[0, 20, 40, 60, 80, 100, 120]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} label={{ value: '# of Professors', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="#f2722b" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
        {/* Placeholder for the tooltip styling seen in the screenshot, difficult to reproduce purely dynamically without full data */}
    </div>
);

const GraphsDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [graphData, setGraphData] = useState({
        tenuredScatter: [],
        nonTenuredScatter: [],
        tenuredBar: [],
        nonTenuredBar: []
    });

    useEffect(() => {
        const fetchGraphs = async () => {
            try {
                const res = await api.get('/dashboard/admin/graphs');
                setGraphData(res.data);
            } catch (error) {
                console.error("Failed to load graphs data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGraphs();
    }, []);

    if (loading) return <div style={{ padding: '2rem' }}>Loading visualizations...</div>;

    return (
        <div style={{ display: 'flex', background: '#fff', minHeight: '100vh', width: '100%' }}>

            {/* Sidebar matches Screenshot Layout */}
            <aside style={{ width: '250px', padding: '2rem 0', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0' }}>
                <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
                    <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Dashboard</h2>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '0.75rem 2rem', cursor: 'pointer', color: '#0f172a', fontWeight: '600' }} onClick={() => navigate('/')}>
                        ← Back to Admin
                    </div>
                    <div style={{ padding: '0.75rem 2rem', cursor: 'pointer', color: '#0f172a', fontWeight: '600' }} onClick={() => navigate('/')}>
                        Professors
                    </div>
                    <div style={{
                        padding: '0.75rem 2rem',
                        cursor: 'pointer',
                        color: '#f2722b',
                        fontWeight: '600',
                        borderLeft: '4px solid #f2722b',
                        background: '#fff6f0'
                    }}>
                        Graphs
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto' }}>

                {/* Tenured Grid */}
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                    <ScatterCard title="Tenured/Tenure Track" data={graphData.tenuredScatter} />
                    <BarChartCard title="Tenured/Tenure Track" data={graphData.tenuredBar} />
                </div>

                {/* Non-Tenured Grid */}
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <ScatterCard title="Non-Tenure" data={graphData.nonTenuredScatter} />
                    <BarChartCard title="Non-Tenure" data={graphData.nonTenuredBar} />
                </div>

            </main>
        </div>
    );
};

export default GraphsDashboard;
