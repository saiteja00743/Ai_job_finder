import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Check } from 'lucide-react';
import { uploadResume, default as api } from '../api';

const ResumeUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [preview, setPreview] = useState('');
    const [existingResume, setExistingResume] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkExistingResume();
    }, []);

    const checkExistingResume = async () => {
        try {
            const { data } = await api.get('/resume-status');
            if (data.hasResume) {
                setExistingResume(data);
                setSuccess(true);
                setPreview(data.preview);
            }
        } catch (err) {
            console.error('Failed to check resume status:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setSuccess(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('resume', file);
            const res = await uploadResume(formData);
            setSuccess(true);
            setPreview(res.textPreview);
            setExistingResume({ hasResume: true, length: res.textPreview.length });
            // Reload the page to refresh match scores
            setTimeout(() => window.location.href = '/', 1500);
        } catch (e) {
            console.error("Upload error details:", e);
            const msg = e.response?.data?.error || e.message || "Upload failed";
            alert("Upload failed: " + msg);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Upload Resume</h2>

            {loading ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p>Checking resume status...</p>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px' }}>
                    <input
                        type="file"
                        id="resume-upload"
                        accept=".pdf,.txt"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    {!file && !success && (
                        <label htmlFor="resume-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <UploadCloud size={48} color="hsl(var(--primary))" style={{ marginBottom: '1rem' }} />
                            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Click to Upload Resume</span>
                            <span style={{ color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>PDF or TXT (Max 5MB)</span>
                        </label>
                    )}

                    {file && !success && (
                        <div style={{ animation: 'fadeIn 0.3s' }}>
                            <FileText size={48} color="hsl(var(--secondary))" style={{ marginBottom: '1rem' }} />
                            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{file.name}</p>
                            <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
                                {uploading ? 'Parsing...' : 'Analyze My Resume'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setFile(null)} style={{ marginLeft: '1rem' }}>
                                Cancel
                            </button>
                        </div>
                    )}

                    {success && (
                        <div style={{ animation: 'fadeIn 0.3s' }}>
                            <div style={{
                                width: '64px', height: '64px', background: 'hsl(var(--success))',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem'
                            }}>
                                <Check size={32} color="white" />
                            </div>
                            <h3>{existingResume ? 'Resume Active!' : 'Resume Analyzed!'}</h3>
                            <p style={{ color: 'hsl(var(--text-muted))', margin: '1rem 0' }}>
                                {existingResume ? 'Your resume is being used to match jobs automatically.' : 'It will now be used to match jobs automatically.'}
                            </p>
                            {existingResume && (
                                <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', marginBottom: '1rem' }}>
                                    Resume size: {existingResume.length} characters
                                </p>
                            )}
                            <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                <strong>Preview (Extracted Skills...):</strong>
                                <p>{preview}</p>
                            </div>
                            <button className="btn btn-secondary" onClick={() => { setSuccess(false); setFile(null); setExistingResume(null); }}>
                                Upload New Resume
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResumeUpload;
