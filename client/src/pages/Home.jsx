import React, { useState, useEffect } from 'react';
import { fetchJobs, recordApplication } from '../api';
import JobCard from '../components/JobCard';
import Filters from '../components/Filters';
import Popup from '../components/Popup';
import { motion } from 'framer-motion';

const Home = () => {
    const [jobs, setJobs] = useState([]);
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(true);

    // Application Tracking State
    const [pendingJob, setPendingJob] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        loadJobs();
    }, [filters]);

    // Smart Tracking: Detect return to tab
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && pendingJob) {
                // Slight delay to ensure user has "returned"
                setTimeout(() => setShowPopup(true), 500);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [pendingJob]);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const data = await fetchJobs(filters);
            let filtered = data;

            // Client-side filter for Match Score (since score is calc on fly)
            if (filters.minMatch) {
                const min = parseInt(filters.minMatch, 10);
                filtered = filtered.filter(j => (j.match?.score || 0) >= min);
            }

            // Sort: Match score desc
            const sorted = filtered.sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));
            setJobs(sorted);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = (job) => {
        setPendingJob(job);
        // Open fake link or real link. Since we don't have real links in mock:
        window.open(`https://google.com/search?q=${job.company}+${job.title}+jobs`, '_blank');
    };

    const handlePopupResult = async (status) => {
        setShowPopup(false);
        if (status === 'Applied' || status === 'Applied Earlier') {
            await recordApplication(pendingJob, status);
            // Ideally show toast notification
        }
        setPendingJob(null);
    };

    const bestMatches = jobs.filter(j => (j.match?.score || 0) > 70).slice(0, 6);
    const otherJobs = jobs.filter(j => !bestMatches.includes(j));
    const hasResume = jobs.length > 0 && jobs[0].match !== undefined;

    return (
        <div className="main-content">
            {!hasResume && !loading && (
                <div className="glass-panel" style={{
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    background: 'hsla(var(--warning), 0.1)',
                    border: '1px solid hsla(var(--warning), 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h4 style={{ color: 'hsl(var(--warning))', marginBottom: '0.3rem' }}>🚀 Enable Smart Matching</h4>
                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>Upload your resume to see match scores and personalized job recommendations.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => window.location.href = '/upload'}>Upload Now</button>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Find Your Next Role</h2>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    {jobs.length} Accessable Jobs
                </div>
            </div>

            <Filters filters={filters} setFilters={setFilters} />

            {bestMatches.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                    <h3 className="gradient-text" style={{ marginBottom: '1rem', fontSize: '1.3rem' }}> ✨ Best Matches For You</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {bestMatches.map(job => (
                            <JobCard key={job.id} job={job} onApply={handleApply} />
                        ))}
                    </div>
                </div>
            )}

            <h3 style={{ marginBottom: '1rem' }}>All Opportunities</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loading ? <p>Loading jobs...</p> : otherJobs.map(job => (
                    <JobCard key={job.id} job={job} onApply={handleApply} />
                ))}
                {otherJobs.length === 0 && !loading && <p>No exact matches found. Try adjusting filters.</p>}
            </div>

            <Popup
                isOpen={showPopup}
                job={pendingJob}
                onClose={() => setShowPopup(false)}
                onConfirm={handlePopupResult}
            />
        </div>
    );
};

export default Home;
