import React from 'react';

const STATUS_COLORS = {
    approved: '#10b981',
    pending: '#94a3b8',
    rejected: '#dc2626'
};

// Custom Donut Chart specifically mapped to the approved vs pending vs rejected statuses
export const ActivityDonutChart = ({ approved, pending, rejected }) => {
    const total = approved + pending + rejected;

    if (total === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                No activities logged yet.
            </div>
        );
    }

    const approvedPercentage = Math.round((approved / total) * 100);
    const pendingPercentage = Math.round((pending / total) * 100);
    const rejectedPercentage = Math.round((rejected / total) * 100);

    // SVG parameters
    const size = 160;
    const strokeWidth = 24;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    // Calculate stroke offsets for each segment
    const approvedDash = (approvedPercentage / 100) * circumference;
    const pendingDash = (pendingPercentage / 100) * circumference;
    const rejectedDash = (rejectedPercentage / 100) * circumference;

    // Ordered sequence: Approved (Green) -> Pending (Gray) -> Rejected (Red)
    const pendingOffset = circumference - approvedDash;
    const rejectedOffset = pendingOffset - pendingDash;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Background track (optional, but good for zero-states) */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth={strokeWidth}
                    />

                    {/* Rejected Segment (Red) */}
                    {rejected > 0 && (
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="transparent"
                            stroke={STATUS_COLORS.rejected}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${rejectedDash} ${circumference}`}
                            strokeDashoffset={rejectedOffset}
                            transform={`rotate(-90 ${center} ${center})`}
                            strokeLinecap="butt"
                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                    )}

                    {/* Pending Segment (Gray/Blue) */}
                    {pending > 0 && (
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="transparent"
                            stroke={STATUS_COLORS.pending}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${pendingDash} ${circumference}`}
                            strokeDashoffset={pendingOffset}
                            transform={`rotate(-90 ${center} ${center})`}
                            strokeLinecap="butt"
                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                    )}

                    {/* Approved Segment (Teal/Green) - rendered last to sit on top ideally, or derived offsets */}
                    {approved > 0 && (
                        <circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="transparent"
                            stroke={STATUS_COLORS.approved}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${approvedDash} ${circumference}`}
                            strokeDashoffset={circumference} // Start from top
                            transform={`rotate(-90 ${center} ${center})`}
                            strokeLinecap="butt"
                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                    )}
                </svg>

                {/* Center Text overlay */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>{approvedPercentage}%</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}>Approved</span>
                </div>
            </div>

            {/* Legend Mapping exactly to Screenshot styling */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', fontSize: '0.8rem', color: '#475569', fontWeight: '500' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <div style={{ width: 12, height: 12, background: STATUS_COLORS.approved }}></div> Approved ({approved})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <div style={{ width: 12, height: 12, background: STATUS_COLORS.pending }}></div> Pending ({pending})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <div style={{ width: 12, height: 12, background: STATUS_COLORS.rejected }}></div> Rejected ({rejected})
                </div>
            </div>
        </div>
    );
};

// Stacked Bar component mirroring the sub-activity progress blocks from the screenshots
export const CategoryStackedBar = ({ categoryName, approved, pending, rejected, totalScore }) => {
    const total = approved + pending + rejected;

    const approvedPct = total === 0 ? 0 : (approved / total) * 100;
    const pendingPct = total === 0 ? 0 : (pending / total) * 100;
    const rejectedPct = total === 0 ? 0 : (rejected / total) * 100;

    return (
        <div style={{
            marginBottom: '1.5rem', padding: '1.5rem', background: 'white',
            borderRadius: '0.5rem', border: '1px solid #e2e8f0'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, color: '#312e81', fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {categoryName} Activity Progress
                </h3>
            </div>

            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>
                {total} activities submitted | {totalScore} Points Earned from Approved Activities
            </p>

            <div style={{
                width: '100%', height: '24px', display: 'flex',
                background: '#f1f5f9', overflow: 'hidden', gap: '2px' // Gap between segments for that clean edge
            }}>
                {approved > 0 && (
                    <div style={{ width: `${approvedPct}%`, background: STATUS_COLORS.approved, transition: 'width 0.5s ease' }}
                        title={`Approved: ${approved}`} />
                )}
                {pending > 0 && (
                    <div style={{ width: `${pendingPct}%`, background: STATUS_COLORS.pending, transition: 'width 0.5s ease' }}
                        title={`Pending: ${pending}`} />
                )}
                {rejected > 0 && (
                    <div style={{ width: `${rejectedPct}%`, background: STATUS_COLORS.rejected, transition: 'width 0.5s ease' }}
                        title={`Rejected: ${rejected}`} />
                )}
                {total === 0 && (
                    <div style={{ width: '100%', background: '#e2e8f0' }} />
                )}
            </div>

            {/* Mini Legend just above the bar in screenshots, but we can put below for spacing */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, background: STATUS_COLORS.approved }}></span> Approved ({approved})
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, background: STATUS_COLORS.pending }}></span> Pending ({pending})
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, background: STATUS_COLORS.rejected }}></span> Rejected ({rejected})
                </span>
            </div>
        </div>
    );
};
