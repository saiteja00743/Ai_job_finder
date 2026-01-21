import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

export const fetchJobs = async (filters) => {
    const { data } = await api.get('/jobs', { params: filters });
    return data;
};

export const uploadResume = async (formData) => {
    const { data } = await api.post('/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const fetchApplications = async () => {
    const { data } = await api.get('/applications');
    return data;
};

export const updateApplication = async (jobId, status) => {
    const { data } = await api.post('/applications/update', { jobId, status });
    return data;
};

export const recordApplication = async (job, status = 'Applied') => {
    const { data } = await api.post('/applications', { job, status });
    return data;
};

export const chatWithAI = async (message) => {
    const { data } = await api.post('/chat', { message });
    return data;
};

export default api;
