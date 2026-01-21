const jobService = require('../services/jobService');
const aiService = require('../services/aiService');
const storageService = require('../services/storageService');
const pdfParse = require('pdf-parse');

async function routes(fastify, options) {

    // GET /jobs
    fastify.get('/jobs', async (request, reply) => {
        const { search, mode, type, location, skills, datePosted } = request.query;
        const jobs = await jobService.fetchJobs({ search, mode, type, location, skills, datePosted });

        // If user has a resume, calculate matches on the fly (or retrieval from cache)
        // For simplicity, we just return jobs here, and client might request scores separately or we include them if userId is passed?
        // Let's keep it simple: Client gets jobs, then Client asks for "match scores" for these jobs given a resume? 
        // Or better: Resume is stored in session/storage. 

        // Let's assume a single user system for this assignment demo
        const resumeText = await storageService.get('resume:default_user');

        if (resumeText) {
            // Calculate scores for all
            // In prod, this should be effectively cached or batched
            const scoredJobs = await Promise.all(jobs.map(async (job) => {
                const match = await aiService.calculateMatchScore(job, resumeText);
                return { ...job, match };
            }));
            return scoredJobs;
        }

        return jobs;
    });

    // POST /upload-resume
    fastify.post('/upload-resume', async (request, reply) => {
        console.log("Receive upload request");
        try {
            const data = await request.file();
            if (!data) {
                console.log("No file data received");
                return reply.code(400).send({ error: "No file uploaded" });
            }

            console.log("File received:", data.filename, data.mimetype);
            const buffer = await data.toBuffer();
            console.log("Buffer size:", buffer.length);

            let text = "";
            try {
                // Check mimetype OR extension
                const isPdf = data.mimetype.includes('pdf') || data.filename.toLowerCase().endsWith('.pdf');

                if (isPdf) {
                    console.log("Parsing PDF...");
                    const pdfData = await pdfParse(buffer);
                    text = pdfData.text;
                    console.log("PDF Parsed, length:", text.length);
                } else {
                    // Assume text/plain or try to read string
                    text = buffer.toString();
                    console.log("Text file read, length:", text.length);
                }
            } catch (e) {
                console.error("Parsing error:", e);
                // Don't fail hard, just try to treat as text if PDF fails? 
                // actually, if PDF parsing fails, it's likely binary garbage.
                return reply.code(400).send({ error: "Failed to parse file: " + e.message });
            }

            // Clean text
            text = text.replace(/\s+/g, ' ').trim();

            if (text.length < 50) {
                return reply.code(400).send({ error: "File content too short or empty." });
            }

            await storageService.set('resume:default_user', text);
            console.log("Resume stored successfully");

            return { success: true, textPreview: text.substring(0, 200) + "..." };
        } catch (err) {
            console.error("Upload handler error:", err);
            return reply.code(500).send({ error: "Internal Server Error during upload" });
        }
    });

    // GET /resume-status - Check if resume exists
    fastify.get('/resume-status', async (request, reply) => {
        const resumeText = await storageService.get('resume:default_user');
        return {
            hasResume: !!resumeText,
            length: resumeText ? resumeText.length : 0,
            preview: resumeText ? resumeText.substring(0, 100) + '...' : null
        };
    });

    // GET /applications
    fastify.get('/applications', async (request, reply) => {
        const apps = await storageService.get('applications:default_user') || [];
        return apps;
    });

    // POST /applications
    fastify.post('/applications', async (request, reply) => {
        const { job, status } = request.body;
        let apps = await storageService.get('applications:default_user') || [];

        // Check if exists
        const exists = apps.find(a => a.job.id === job.id);
        if (exists) {
            exists.status = status || exists.status;
            exists.updatedAt = new Date().toISOString();
        } else {
            apps.push({
                id: job.id, // using job id as app id for simplicity
                job,
                status: status || 'Applied', // Applied, Interview, Offer, Rejected
                appliedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        await storageService.set('applications:default_user', apps);
        return { success: true, applications: apps };
    });

    // POST /applications/update
    fastify.post('/applications/update', async (request, reply) => {
        const { jobId, status } = request.body;
        let apps = await storageService.get('applications:default_user') || [];

        const appIndex = apps.findIndex(a => a.job.id === jobId);
        if (appIndex > -1) {
            apps[appIndex].status = status;
            apps[appIndex].updatedAt = new Date().toISOString();
            await storageService.set('applications:default_user', apps);
            return { success: true };
        }
        return reply.code(404).send({ error: "Application not found" });
    });

    // POST /chat
    fastify.post('/chat', async (request, reply) => {
        const { message } = request.body;

        let jobs = await jobService.fetchJobs();
        const resumeText = await storageService.get('resume:default_user');

        // Calculate matches to give context to AI
        if (resumeText) {
            jobs = await Promise.all(jobs.map(async (job) => {
                // We use the cached score or calculate it. 
                // optimizing: maybe just calculate for the top few or use a lighter check?
                // For this demo, let's just calculate for the first 5 to save tokens/time if using real AI
                // or just rely on the AI's ability to see the job description vs resume in the prompt?
                // Better: Let's actually run the match so the "score" field is present.
                const match = await aiService.calculateMatchScore(job, resumeText);
                return { ...job, match };
            }));

            // Sort by score
            jobs.sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));
        }

        // Limit context to top 5 jobs to avoid token limits
        const topJobs = jobs.slice(0, 5).map(j => ({
            title: j.title,
            company: j.company,
            matchScore: j.match?.score,
            matchReason: j.match?.reason,
            description: j.description.slice(0, 200) + "..."
        }));

        const context = [
            { role: "system", content: `Current top job matches for user:\n${JSON.stringify(topJobs, null, 2)}` }
        ];

        const response = await aiService.chat(message, context);
        return { response };
    });
}

module.exports = routes;
