import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Popup = ({ job, isOpen, onClose, onConfirm }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="glass-panel"
                        style={{ width: '90%', maxWidth: '400px', padding: '2rem', background: 'hsl(var(--bg-card))' }}
                    >
                        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Did you apply?</h3>
                        <p style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', marginBottom: '2rem' }}>
                            We noticed you visited the application page for <strong>{job?.title}</strong> at <strong>{job?.company}</strong>.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <button className="btn" style={{ background: 'hsl(var(--success))', color: 'white' }}
                                onClick={() => onConfirm('Applied')}>
                                Yes, Applied
                            </button>
                            <button className="btn btn-secondary" onClick={() => onConfirm('Rejected')}>
                                No, just browsing
                            </button>
                            <button className="btn btn-secondary" style={{ opacity: 0.7 }} onClick={() => onConfirm('Applied Earlier')}>
                                I Applied Earlier
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Popup;
