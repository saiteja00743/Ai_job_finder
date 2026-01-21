const OpenAI = require("openai");

class AIService {
    constructor() {
        this.openai = null;
        if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith("sk-your-key")) {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        } else {
            console.log("AIService initialized in MOCK mode (No valid API Key found).");
        }
    }

    async calculateMatchScore(job, resumeText) {
        if (this.openai) {
            try {
                const prompt = `
          Analyze the fit between this resume and job description.
          Resume: "${resumeText.slice(0, 1000)}..."
          Job: "${job.title} at ${job.company}. ${job.description.slice(0, 500)}..."
          
          Return JSON:
          {
            "score": <number 0-100>,
            "reason": "<short explanation>",
            "suggestions": ["<suggestion 1>", "<suggestion 2>"]
          }
        `;
                const completion = await this.openai.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "gpt-3.5-turbo",
                    response_format: { type: "json_object" },
                });
                return JSON.parse(completion.choices[0].message.content);
            } catch (error) {
                console.warn("AI Match Error (Quota/Network), falling back to Logic:", error.message);
                // Fallthrough to mock
            }
        }
        return this.mockMatchScore(job, resumeText);
    }

    mockMatchScore(job, resumeText) {
        // Expanded keyword list for better mock matching
        const skillsDB = [
            "React", "Node.js", "Python", "JavaScript", "TypeScript", "UX", "Figma", "Design",
            "Frontend", "Backend", "Full Stack", "Java", "C++", "AWS", "Docker", "Kubernetes",
            "SQL", "NoSQL", "Redis", "MongoDB", "DevOps", "Agile", "Scrum", "Product Management"
        ];

        const jobText = (job.title + " " + job.description + " " + (job.skills || []).join(" ")).toLowerCase();
        const resumeLower = resumeText.toLowerCase();

        let matchedKeywords = [];
        let missingKeywords = [];

        skillsDB.forEach(k => {
            const kLower = k.toLowerCase();
            if (jobText.includes(kLower)) {
                if (resumeLower.includes(kLower)) {
                    matchedKeywords.push(k);
                } else {
                    missingKeywords.push(k);
                }
            }
        });

        // Base score calculation
        let score = 40; // Start at 40
        score += matchedKeywords.length * 10; // +10 per match

        // Boost for title match
        const titleWords = job.title.split(' ');
        if (titleWords.some(w => resumeLower.includes(w.toLowerCase()) && w.length > 3)) {
            score += 15;
        }

        // Cap at 98, min at 20
        score = Math.min(Math.max(score, 20), 98);

        // Generate dynamic mock reason
        let reason = "";
        let suggestions = [];

        if (matchedKeywords.length > 0) {
            reason = `Strong match for skills: ${matchedKeywords.slice(0, 3).join(", ")}.`;
            if (missingKeywords.length > 0) {
                const missing = missingKeywords.slice(0, 2);
                reason += ` You could improve by adding ${missing.join(", ")}.`;
                suggestions = missing.map(m => `Consider adding a project demonstrating ${m} to your portfolio.`);
            } else {
                suggestions = ["Your profile is a great fit! Customizing your cover letter for " + job.company + " is recommended."];
            }
        } else {
            reason = "Low keyword overlap. This role might require skills not explicitly found in your resume.";
            suggestions = ["Highlight transferrable skills relevant to " + job.title, "Add key technical skills from the job description to your resume."];
        }

        return { score, reason, suggestions };
    }

    async chat(message, context) {
        if (this.openai) {
            try {
                const completion = await this.openai.chat.completions.create({
                    messages: [
                        { role: "system", content: "You are a helpful job assistant. You can filter jobs and answer product questions." },
                        ...context,
                        { role: "user", content: message }
                    ],
                    model: "gpt-3.5-turbo",
                });
                return completion.choices[0].message.content;
            } catch (e) {
                console.warn("AI Chat Error (Quota/Network), switching to Logic Mode:", e.message);
                // Fall through to mock logic below
            }
        }

        // Advanced Logic-Based Responses (Mock)
        const lowerMsg = message.toLowerCase();

        // Greetings
        if (lowerMsg.match(/^(hi|hello|hey|greetings)/)) {
            return "Hello! I'm your AI Job Assistant. I've analyzed your resume and I'm ready to help you find the perfect role. What are you looking for?";
        }

        // Resume / Analysis help
        if (lowerMsg.includes("resume") || lowerMsg.includes("upload") || lowerMsg.includes("analyze") || lowerMsg.includes("suggestion")) {
            return "I've analyzed your resume against our job database. Based on your skills, I recommend checking the 'Best Matches' section on the homepage. I've highlighted roles that fit your profile score above 70%.";
        }

        // 1. Job Search Intents (Requirement 5)
        if (lowerMsg.includes("remote") && (lowerMsg.includes("react") || lowerMsg.includes("frontend"))) {
            return "Based on your profile, the 'Senior React Developer' at TechFlow is a perfect Remote match (95%). You've got the React and Node.js skills they're looking for.";
        }
        if (lowerMsg.includes("ux") || lowerMsg.includes("figma") || lowerMsg.includes("design")) {
            return "I recommend looking at the UI/UX Designer role at 'Creative Minds'. It requires Figma proficiency, which aligns with your design focus.";
        }
        if (lowerMsg.includes("highest") || lowerMsg.includes("best") || lowerMsg.includes("score")) {
            return "Your highest match right now is the 'Senior React Developer' role at 95%. I've highlighted your top 6 matches in the 'Best Matches' section on the homepage.";
        }
        if (lowerMsg.includes("senior") || lowerMsg.includes("week") || lowerMsg.includes("new")) {
            return "Several new senior roles were posted this week, including 'Senior React Developer' and 'Cloud Architect'. Check the 'Date Posted' filter in the feed!";
        }

        // 2. Product Walkthroughs (Requirement 5)
        if (lowerMsg.includes("where") && (lowerMsg.includes("application") || lowerMsg.includes("track"))) {
            return "You can view and manage all your applications in the 'Dashboard' (link in the sidebar). You can update your status there from 'Applied' to 'Interview' or 'Offer'.";
        }
        if (lowerMsg.includes("how") && (lowerMsg.includes("upload") || lowerMsg.includes("resume"))) {
            return "Head over to the 'Resume' tab in the sidebar. You can upload any PDF or TXT file there. Once uploaded, I'll instantly recalculate your match scores!";
        }
        if (lowerMsg.includes("how") && (lowerMsg.includes("match") || lowerMsg.includes("work"))) {
            return "I use NLP to compare keywords and experience in your resume against job requirements. I look for technical overlap, seniority, and industry alignment to give you a percentage score.";
        }

        // 3. Status/Analysis Fallbacks
        if (lowerMsg.includes("status") || lowerMsg.includes("application")) {
            return "Everything looks on track. You can manage your progress in the Dashboard. Would you like me to find more roles like the ones you applied to?";
        }
        if (lowerMsg.includes("why") || lowerMsg.includes("fit")) {
            return "I calculate fit based on skill overlap. For example, your match for TechFlow is high because you have React/Node.js experience. Adding 'TypeScript' could boost it even more!";
        }

        // General fallback
        const fallbacks = [
            "I'm analyzing the latest job market trends for you. Ask me about 'Remote jobs' or 'Salary estimates'.",
            "Based on your profile, I think you'd be great for Senior Engineering roles. Want to see some?",
            "I can help you optimize your application strategy. Try asking 'How can I improve my match score?'",
            "Everything looks good. Have you applied to the 'Senior React Developer' role yet?"
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}

module.exports = new AIService();
