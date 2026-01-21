const mockJobsData = [
    {
        id: "1",
        title: "Senior React Developer",
        company: "TechFlow Solutions",
        location: "San Francisco, CA",
        type: "Full-time",
        mode: "Remote",
        salary: "$120k - $150k",
        posted_at: new Date().toISOString(),
        description: "We are looking for an experienced React developer to lead our frontend team. You should be proficient in React, Node.js, and modern CSS practices. Experience with state management matches is a plus.",
        skills: ["React", "Node.js", "Redux", "TypeScript"],
        logo: "https://via.placeholder.com/50"
    },
    {
        id: "2",
        title: "UX/UI Designer",
        company: "Creative Minds",
        location: "New York, NY",
        type: "Contract",
        mode: "Hybrid",
        salary: "$90k - $110k",
        posted_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        description: "Join our creative team to design world-class user interfaces. Proficiency in Figma and Adobe Suite is required. Knowledge of HTML/CSS is helpful.",
        skills: ["Figma", "UX", "UI", "Adobe XD"],
        logo: "https://via.placeholder.com/50"
    },
    {
        id: "3",
        title: "Backend Engineer (Python)",
        company: "DataSystems Inc",
        location: "Austin, TX",
        type: "Full-time",
        mode: "On-site",
        salary: "$130k - $160k",
        posted_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        description: "Seeking a Python expert to build robust backend systems. Experience with Django or Flask and PostgreSQL is essential.",
        skills: ["Python", "Django", "PostgreSQL", "API"],
        logo: "https://via.placeholder.com/50"
    },
    {
        id: "4",
        title: "Product Manager",
        company: "GrowthStartup",
        location: "Remote",
        type: "Full-time",
        mode: "Remote",
        salary: "$140k - $180k",
        posted_at: new Date(Date.now() - 400000000).toISOString(), // ~5 days ago
        description: "Lead our product roadmap and strategy. Must have experience in Agile environments and user research.",
        skills: ["Product Management", "Agile", "Jira", "Strategy"],
        logo: "https://via.placeholder.com/50"
    },
    {
        id: "5",
        title: "Junior Frontend Developer",
        company: "WebWizards",
        location: "London, UK",
        type: "Internship",
        mode: "Hybrid",
        salary: "$40k - $50k",
        posted_at: new Date().toISOString(),
        description: "Great opportunity for a junior dev to learn React and modern web development.",
        skills: ["React", "JavaScript", "HTML", "CSS"],
        logo: "https://via.placeholder.com/50"
    }
];

// Generate more jobs function
const generateMoreJobs = () => {
    const roles = [
        "Software Engineer", "DevOps Engineer", "Data Scientist", "Mobile Developer",
        "Java Developer", "C++ Systems Engineer", "Cloud Architect", "QA Automation Engineer",
        "Cybersecurity Analyst", "Machine Learning Engineer", "Frontend Developer", "Full Stack Developer"
    ];
    const companies = ["Globex", "Initech", "Umbrella Corp", "Stark Ind", "Acme Corp", "Hooli", "Pied Piper", "Massive Dynamic"];
    const modes = ["Remote", "On-site", "Hybrid"];
    const types = ["Full-time", "Contract", "Part-time", "Internship"];

    let jobs = [];
    const domains = {
        "Globex": "globex.com",
        "Initech": "initech.com",
        "Umbrella Corp": "umbrella.com",
        "Stark Ind": "stark.com",
        "Acme Corp": "acme.com",
        "Hooli": "hooli.xyz",
        "Pied Piper": "piedpiper.com",
        "Massive Dynamic": "massivedynamic.com"
    };

    for (let i = 6; i <= 50; i++) {
        const title = roles[Math.floor(Math.random() * roles.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        jobs.push({
            id: i.toString(),
            title: title,
            company: company,
            location: modes[Math.floor(Math.random() * modes.length)] === "Remote" ? "Remote" : "New York, NY",
            type: types[Math.floor(Math.random() * types.length)],
            mode: modes[Math.floor(Math.random() * modes.length)],
            salary: `$${100 + Math.floor(Math.random() * 60)}k - $${160 + Math.floor(Math.random() * 40)}k`,
            posted_at: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)).toISOString(), // Last 30 days
            description: `We are looking for a highly motivated ${title} to join our growing team at ${company}. You will be responsible for building innovative solutions and collaborating with cross-functional teams.`,
            skills: [title.split(' ')[0], "Agile", "Teamwork", "Problem Solving"],
            logo: `https://logo.clearbit.com/${domains[company] || 'google.com'}`
        });
    }
    return jobs;
};

const allMockJobs = [...mockJobsData, ...generateMoreJobs()];

class JobService {
    async fetchJobs(filters = {}) {
        // In a real app, this would call Axios.get(API_URL)
        // Here we simulate API delay and filtering

        let jobs = allMockJobs;

        // Apply Filters (Simulating backend filtering)
        if (filters.search) {
            const q = filters.search.toLowerCase();
            jobs = jobs.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q));
        }

        if (filters.mode) {
            jobs = jobs.filter(j => j.mode.toLowerCase() === filters.mode.toLowerCase());
        }

        if (filters.location) {
            const l = filters.location.toLowerCase();
            jobs = jobs.filter(j => j.location.toLowerCase().includes(l));
        }

        if (filters.skills) {
            const searchedSkills = filters.skills.split(',').map(s => s.trim().toLowerCase()).filter(s => s !== "");
            if (searchedSkills.length > 0) {
                jobs = jobs.filter(j => {
                    const jobSkills = (j.skills || []).map(s => s.toLowerCase());
                    return searchedSkills.some(ss => jobSkills.some(js => js.includes(ss)));
                });
            }
        }

        if (filters.datePosted) {
            const now = new Date();
            let limit;
            if (filters.datePosted === '24h') limit = 24 * 60 * 60 * 1000;
            else if (filters.datePosted === '7d') limit = 7 * 24 * 60 * 60 * 1000;
            else if (filters.datePosted === '30d') limit = 30 * 24 * 60 * 60 * 1000;

            if (limit) {
                jobs = jobs.filter(j => {
                    const posted = new Date(j.posted_at);
                    return (now.getTime() - posted.getTime()) <= limit;
                });
            }
        }

        if (filters.type) {
            jobs = jobs.filter(j => j.type.toLowerCase() === filters.type.toLowerCase());
        }

        // Simulate API delay
        // await new Promise(resolve => setTimeout(resolve, 500)); 

        return jobs;
    }
}

module.exports = new JobService();
