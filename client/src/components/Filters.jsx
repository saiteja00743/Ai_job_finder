import React from 'react';

const Filters = ({ filters, setFilters }) => {
    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Filters</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>

                {/* Search */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Search Role</label>
                    <input
                        type="text"
                        placeholder="e.g. React Developer"
                        value={filters.search || ''}
                        onChange={(e) => handleChange('search', e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Mode */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Work Mode</label>
                    <select
                        value={filters.mode || ''}
                        onChange={(e) => handleChange('mode', e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <option value="">Any</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                    </select>
                </div>

                {/* Type */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Job Type</label>
                    <select
                        value={filters.type || ''}
                        onChange={(e) => handleChange('type', e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <option value="">Any</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                    </select>
                </div>

                {/* Location */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Location</label>
                    <input
                        type="text"
                        placeholder="City or Region"
                        value={filters.location || ''}
                        onChange={(e) => handleChange('location', e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Skills */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Skills (comma separated)</label>
                    <input
                        type="text"
                        placeholder="e.g. React, Node"
                        value={filters.skills || ''}
                        onChange={(e) => handleChange('skills', e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Date Posted */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Date Posted</label>
                    <select
                        value={filters.datePosted || ''}
                        onChange={(e) => handleChange('datePosted', e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <option value="">Any Time</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last Week</option>
                        <option value="30d">Last Month</option>
                    </select>
                </div>

                {/* Match Score */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Min Match %</label>
                    <select
                        value={filters.minMatch || ''}
                        onChange={(e) => handleChange('minMatch', e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <option value="">Any</option>
                        <option value="70">High ({'>'}70%)</option>
                        <option value="40">Medium ({'>'}40%)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Filters;
