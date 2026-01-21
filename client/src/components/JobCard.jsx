import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const JobCard = ({ job, onApply }) => {
    const { title, company, location, type, salary, description, skills, match } = job;

    const getMatchColor = (score) => {
        if (score >= 70) return 'match-high';
        if (score >= 40) return 'match-med';
        return 'match-low';
    };

    const score = match ? match.score : 0;
    const reason = match ? match.reason : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{ padding: '1.5rem', marginBottom: '1rem', position: 'relative', overflow: 'hidden' }}
        >
            {match && (
                <div className={`badge ${getMatchColor(score)}`} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    {score}% Match
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                    width: '56px', height: '56px',
                    background: 'hsla(0,0%,100%,0.05)',
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', fontWeight: 'bold', overflow: 'hidden', border: '1px solid hsla(0,0%,100%,0.1)'
                }}>
                    {job.logo ? (
                        <img
                            src={job.logo}
                            alt={company}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = company.charAt(0);
                            }}
                        />
                    ) : company.charAt(0)}
                </div>

                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{title}</h3>
                    <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', marginBottom: '0.8rem' }}>{company} • {location}</p>

                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <span className="badge" style={{ background: 'hsla(0,0%,100%,0.1)' }}>{type}</span>
                        <span className="badge" style={{ background: 'hsla(0,0%,100%,0.1)' }}>{job.mode}</span>
                        <span className="badge" style={{ background: 'hsla(0,0%,100%,0.1)' }}>{salary}</span>
                    </div>

                    <p style={{ fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1rem', color: 'hsl(var(--text-muted))' }}>
                        {description}
                    </p>

                    <div style={{ marginBottom: '1.2rem' }}>
                        {skills.map(s => (
                            <span key={s} style={{
                                fontSize: '0.8rem', color: 'hsl(var(--secondary))',
                                marginRight: '0.5rem', background: 'hsla(180, 100%, 45%, 0.1)',
                                padding: '2px 8px', borderRadius: '4px'
                            }}>
                                {s}
                            </span>
                        ))}
                    </div>

                    {match && (
                        <div style={{
                            background: 'hsla(240, 10%, 10%, 0.5)', padding: '0.8rem',
                            borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem'
                        }}>
                            <strong style={{ color: 'hsl(var(--primary))' }}>AI Insight:</strong> {reason}
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        onClick={() => onApply(job)}
                        style={{ width: '100%' }}
                    >
                        Apply Now
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default JobCard;
