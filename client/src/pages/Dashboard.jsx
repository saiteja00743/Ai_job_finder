import React, { useEffect, useState } from 'react';
import { fetchApplications, updateApplication } from '../api';
import { Clock, CheckCircle, XCircle, Calendar, ArrowRight } from 'lucide-react';

const Dashboard = () => {
    const [apps, setApps] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        loadApps();
    }, []);

    const loadApps = async () => {
        const data = await fetchApplications();
        setApps(data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    };

    const handleStatusUpdate = async (jobId, newStatus) => {
        await updateApplication(jobId, newStatus);
        loadApps();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Applied': return 'hsl(var(--primary))';
            case 'Applied Earlier': return 'hsl(var(--secondary))';
            case 'Interview': return 'hsl(var(--warning))';
            case 'Offer': return 'hsl(var(--success))';
            case 'Rejected': return 'hsl(var(--error))';
            default: return 'hsl(var(--text-muted))';
        }
    };

    const stats = {
        total: apps.length,
        applied: apps.filter(a => a.status === 'Applied').length,
        interviews: apps.filter(a => a.status === 'Interview').length,
        offers: apps.filter(a => a.status === 'Offer').length
    };

    const filteredApps = statusFilter === 'All'
        ? apps
        : apps.filter(a => a.status === statusFilter);

    return (
        <div className="main-content">
            <h2 style={{ marginBottom: '2rem' }}>Application Dashboard</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'All', val: stats.total, color: 'var(--text-muted)', f: 'All' },
                    { label: 'Applied', val: stats.applied, color: 'var(--primary)', f: 'Applied' },
                    { label: 'Interviews', val: stats.interviews, color: 'var(--warning)', f: 'Interview' },
                    { label: 'Offers', val: stats.offers, color: 'var(--success)', f: 'Offer' }
                ].map((s, i) => (
                    <div
                        key={i}
                        className="glass-panel"
                        onClick={() => setStatusFilter(s.f)}
                        style={{
                            padding: '1.5rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: statusFilter === s.f ? '1px solid hsl(var(--primary))' : '1px solid hsla(0,0%,100%,0.1)',
                            background: statusFilter === s.f ? 'hsla(var(--primary), 0.1)' : ''
                        }}
                    >
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: `hsl(${s.color})`, marginBottom: '0.5rem' }}>{s.val}</div>
                        <div style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Timeline {statusFilter !== 'All' ? `(${statusFilter})` : ''}</h3>
                {filteredApps.length === 0 ? (
                    <p style={{ color: 'hsl(var(--text-muted))' }}>No {statusFilter.toLowerCase()} applications found.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {filteredApps.map((app) => (
                            <div key={app.id} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px',
                                    color: 'hsl(var(--text-muted))', fontSize: '0.8rem'
                                }}>
                                    <span>{new Date(app.updatedAt).toLocaleDateString()}</span>
                                    <span>{new Date(app.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>

                                <div style={{
                                    width: '2px', height: '50px', background: 'hsla(0,0%,100%,0.1)', position: 'relative'
                                }}>
                                    <div style={{
                                        width: '12px', height: '12px', borderRadius: '50%', background: getStatusColor(app.status),
                                        position: 'absolute', top: '50%', left: '-5px', transform: 'translateY(-50%)'
                                    }} />
                                </div>

                                <div style={{ flex: 1, background: 'hsla(0,0%,0%,0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{app.job.title}</h4>
                                        <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>{app.job.company}</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div className="badge" style={{
                                            background: getStatusColor(app.status), color: 'white', opacity: 0.8
                                        }}>
                                            {app.status}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {app.status !== 'Rejected' && app.status !== 'Offer' && (
                                                <>
                                                    <button className="btn" style={{ padding: '0.4rem', fontSize: '0.8rem', background: 'hsla(0,0%,100%,0.1)' }}
                                                        onClick={() => handleStatusUpdate(app.id, 'Interview')}>
                                                        Interviewing
                                                    </button>
                                                    <button className="btn" style={{ padding: '0.4rem', fontSize: '0.8rem', background: 'hsla(0,0%,100%,0.1)' }}
                                                        onClick={() => handleStatusUpdate(app.id, 'Offer')}>
                                                        Offer
                                                    </button>
                                                    <button className="btn" style={{ padding: '0.4rem', fontSize: '0.8rem', background: 'hsla(0,0%,100%,0.1)' }}
                                                        onClick={() => handleStatusUpdate(app.id, 'Rejected')}>
                                                        Rejected
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
