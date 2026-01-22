<<<<<<< HEAD
# AI-Powered Job Tracker with Smart Matching

A full-stack web application that helps job seekers find and track opportunities using AI-powered resume matching, intelligent filtering, and automated application tracking.

## 🌟 Features

- **AI-Powered Job Matching**: Automatically scores jobs (0-100%) based on resume compatibility
- **Smart Application Tracking**: Detects when you return from applying and prompts you to track it
- **Intelligent AI Assistant**: Chat interface that answers job queries and product questions
- **Advanced Filtering**: 7 filters including skills, location, date posted, work mode, and match score
- **Resume Analysis**: Upload PDF/TXT resumes for instant skill extraction and matching
- **Application Dashboard**: Timeline view with status tracking (Applied → Interview → Offer/Rejected)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

---

## 📋 Table of Contents

1. [Architecture Diagram](#architecture-diagram)
2. [Setup Instructions](#setup-instructions)
3. [AI Matching Logic](#ai-matching-logic)
4. [Critical Thinking: Popup Flow](#critical-thinking-popup-flow)
5. [Scalability](#scalability)
6. [Tradeoffs](#tradeoffs)
7. [Tech Stack](#tech-stack)
9. [Deployment](#deployment)
10. [API Documentation](#api-documentation)

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Jobs Feed   │  │  Dashboard   │  │Resume Upload │          │
│  │  (Home.jsx)  │  │(Dashboard.jsx│  │(ResumeUpload)│          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┴──────────────────┘                   │
│                           │                                      │
│                    ┌──────▼──────┐                              │
│                    │   API Layer  │                              │
│                    │   (api.js)   │                              │
│                    └──────┬───────┘                              │
└───────────────────────────┼──────────────────────────────────────┘
                            │ HTTP (Axios)
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                      BACKEND (Fastify)                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    API Routes (api.js)                   │    │
│  │  GET  /jobs          POST /upload-resume                │    │
│  │  GET  /applications  POST /applications                 │    │
│  │  POST /chat          GET  /resume-status                │    │
│  └────┬────────────────────┬────────────────────┬──────────┘    │
│       │                    │                    │                │
│  ┌────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐      │
│  │ JobService  │  │   AIService     │  │ StorageService │      │
│  │             │  │                 │  │                │      │
│  │ - fetchJobs │  │ - matchScore    │  │ - set/get/del  │      │
│  │ - filter    │  │ - chat          │  │ - file persist │      │
│  └─────────────┘  └────────┬────────┘  └───────┬────────┘      │
│                            │                    │                │
│                    ┌───────▼────────┐  ┌────────▼────────┐      │
│                    │  OpenAI API    │  │ storage.json    │      │
│                    │  (GPT-3.5)     │  │ (File System)   │      │
│                    └────────────────┘  └─────────────────┘      │
└──────────────────────────────────────────────────────────────────┘

DATA FLOW:
1. User uploads resume → Parsed (pdf-parse) → Stored in storage.json
2. User views jobs → JobService fetches → AIService scores → Returns with match %
3. User clicks Apply → Opens external link → Returns → Popup shows → Saves to storage
4. User chats with AI → Context (top jobs) sent → OpenAI/Logic responds
5. User views Dashboard → Loads applications from storage.json → Displays timeline
```

### Component Breakdown

**Frontend Components:**
- `Home.jsx` - Job feed with filters and Best Matches section
- `Dashboard.jsx` - Application timeline with status filters
- `ResumeUpload.jsx` - Resume upload with status check
- `JobCard.jsx` - Individual job display with match score
- `Filters.jsx` - 7-filter system (Role, Skills, Date, Type, Mode, Location, Match)
- `Chat.jsx` - AI assistant sidebar
- `Popup.jsx` - Smart application tracking popup

**Backend Services:**
- `JobService` - Mock job data generation and filtering
- `AIService` - Resume matching (OpenAI + fallback logic)
- `StorageService` - File-based persistence (storage.json)

**Data Structure:**
```javascript
// storage.json
{
  "resume:default_user": "Skills: React, Node.js, Python...",
  "applications:default_user": [
    {
      "id": "job-1",
      "title": "Senior React Developer",
      "company": "TechFlow",
      "status": "Applied",
      "appliedAt": "2026-01-22T00:00:00.000Z",
      "updatedAt": "2026-01-22T00:00:00.000Z"
    }
  ]
}
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 16+ and npm
- **Git** (for cloning)
- **Optional**: Redis (for production storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-job-tracker
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3000

# OpenAI API (Optional - falls back to logic-based matching)
OPENAI_API_KEY=your_openai_api_key_here

# Redis (Optional - uses file storage by default)
REDIS_URL=redis://localhost:6379
```

**Note**: The app works without OpenAI API key using intelligent keyword-based matching.

### Running Locally

#### Development Mode (Recommended)

**Terminal 1 - Backend:**
```bash
cd server
npm start
```
Server runs on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:5173`

#### Production Build

```bash
cd client
npm run build

cd ../server
npm start
# Server will serve static files from client/dist
```

### Verification

1. Open `http://localhost:5173`
2. You should see the Jobs Feed
3. Upload a resume at `/upload`
4. Check match scores appear on job cards

---

## 🤖 AI Matching Logic

### Overview

The AI matching system scores each job (0-100%) based on resume compatibility using a hybrid approach:

1. **Primary**: OpenAI GPT-3.5-turbo (when API key available)
2. **Fallback**: Intelligent keyword-based algorithm

### Scoring Algorithm (Fallback Logic)

```javascript
// File: server/src/services/aiService.js

function calculateMatchScore(job, resumeText) {
  // 1. Extract Keywords
  const jobKeywords = extractKeywords(job.title + ' ' + job.description);
  const resumeKeywords = extractKeywords(resumeText);
  
  // 2. Match Keywords
  let matchedSkills = [];
  let missingSkills = [];
  
  jobKeywords.forEach(keyword => {
    if (resumeKeywords.includes(keyword)) {
      matchedSkills.push(keyword);
    } else {
      missingSkills.push(keyword);
    }
  });
  
  // 3. Calculate Base Score
  let score = 40; // Base score
  score += matchedSkills.length * 10; // +10 per matched skill
  
  // 4. Title Match Bonus
  if (jobTitleMatchesResume(job.title, resumeText)) {
    score += 15;
  }
  
  // 5. Normalize (20-98 range)
  score = Math.min(Math.max(score, 20), 98);
  
  // 6. Generate Explanation
  const reason = `Strong match for skills: ${matchedSkills.slice(0, 3).join(', ')}.`;
  const suggestions = missingSkills.map(s => 
    `Consider adding ${s} to your portfolio`
  );
  
  return { score, reason, suggestions };
}
```

### OpenAI Integration

When `OPENAI_API_KEY` is set:

```javascript
const prompt = `
You are a job matching expert. Score this job for the candidate.

Job: ${job.title} at ${job.company}
Description: ${job.description}

Candidate Resume: ${resumeText}

Provide:
1. Match score (0-100)
2. Reason (key skills that match)
3. Suggestions (what to improve)
`;

const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: prompt }]
});
```

### Efficiency Considerations

**Caching Strategy:**
- Resume is stored once in `storage.json`
- Match scores calculated on-demand (not pre-computed)
- Top 5 jobs sent as context to AI assistant (token optimization)

**Performance:**
- Keyword matching: ~1-2ms per job
- OpenAI API: ~500-1000ms per job (batched in production)
- File I/O: ~5-10ms (async, non-blocking)

**Scalability:**
- For 100 jobs: ~200ms (keyword) or ~10s (OpenAI batched)
- For 10,000 jobs: Use job indexing + lazy loading

---

## 💡 Critical Thinking: Popup Flow

### Problem Statement

**Challenge**: Track job applications without requiring manual input while respecting user privacy and avoiding false positives.

**Constraints**:
- Can't access external website data (CORS, privacy)
- Can't force users to manually log every application
- Must handle edge cases (browsing vs. applying)

### Design Decisions

#### 1. **Tab Visibility Detection**

**Approach**: Use `document.visibilitychange` event to detect when user returns.

```javascript
// File: client/src/pages/Home.jsx

useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && pendingJob) {
      // User returned to tab
      setTimeout(() => setShowPopup(true), 1000); // 1s delay
    }
  };
  
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, [pendingJob]);
```

**Why 1-second delay?**
- Avoids popup showing during accidental tab switches
- Gives user time to orient themselves
- Feels less intrusive

#### 2. **Three-Option Popup**

**Options:**
1. **"Yes, Applied"** → Save as "Applied" with timestamp
2. **"No, just browsing"** → Discard, no record
3. **"Applied Earlier"** → Save as "Applied Earlier" (different status)

**Why three options?**
- **Accuracy**: Distinguishes between fresh applications and past ones
- **User Control**: Respects browsing behavior
- **Data Quality**: Prevents false positives

#### 3. **State Management**

```javascript
const [pendingJob, setPendingJob] = useState(null);
const [showPopup, setShowPopup] = useState(false);

const handleApply = (job) => {
  setPendingJob(job); // Store job reference
  window.open(jobLink, '_blank'); // Open in new tab
};

const handlePopupResult = async (status) => {
  if (status === 'Applied' || status === 'Applied Earlier') {
    await recordApplication(pendingJob, status);
  }
  setPendingJob(null); // Clear pending state
  setShowPopup(false);
};
```

### Edge Cases Handled

| Edge Case | Solution |
|-----------|----------|
| User opens multiple jobs | Only tracks the last clicked job |
| User closes tab without returning | Popup never shows (no false record) |
| User switches tabs accidentally | 1-second delay prevents premature popup |
| User applied weeks ago | "Applied Earlier" option with separate status |
| User just browsing | "No, just browsing" option (no record) |
| Server restart | Pending state lost (acceptable - no popup spam) |

### Alternatives Considered

#### ❌ **Browser Extension**
- **Pro**: Could detect form submissions
- **Con**: Requires installation, privacy concerns, not web-based

#### ❌ **Email Parsing**
- **Pro**: Automatic detection via confirmation emails
- **Con**: Requires email access, delayed, privacy issues

#### ❌ **Manual Entry Only**
- **Pro**: Simple, accurate
- **Con**: High friction, users forget

#### ✅ **Chosen: Visibility Detection + Popup** (Best Balance)
- **Pro**: No installation, privacy-friendly, low friction
- **Con**: Relies on user honesty (acceptable tradeoff)

---

## 📈 Scalability

### Current Capacity

**Single Server:**
- **Jobs**: 50-100 jobs (mock data)
- **Users**: 1 user (demo mode)
- **Storage**: File-based (storage.json)

### Scaling to 100 Jobs & 10,000 Users

#### 1. **Database Migration**

**Current**: File-based storage (storage.json)

**Scaled**:
```javascript
// PostgreSQL Schema
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP
);

CREATE TABLE resumes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  text TEXT,
  uploaded_at TIMESTAMP
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  company VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP,
  INDEX idx_created_at (created_at)
);

CREATE TABLE applications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  job_id UUID REFERENCES jobs(id),
  status VARCHAR(50),
  applied_at TIMESTAMP,
  INDEX idx_user_status (user_id, status)
);

CREATE TABLE match_scores (
  user_id UUID REFERENCES users(id),
  job_id UUID REFERENCES jobs(id),
  score INTEGER,
  reason TEXT,
  calculated_at TIMESTAMP,
  PRIMARY KEY (user_id, job_id),
  INDEX idx_score (user_id, score DESC)
);
```

#### 2. **Caching Strategy**

```javascript
// Redis Caching
const redis = new Redis();

// Cache match scores (24h TTL)
async function getMatchScore(userId, jobId) {
  const cached = await redis.get(`match:${userId}:${jobId}`);
  if (cached) return JSON.parse(cached);
  
  const score = await calculateMatchScore(userId, jobId);
  await redis.setex(`match:${userId}:${jobId}`, 86400, JSON.stringify(score));
  return score;
}

// Cache job listings (1h TTL)
async function getJobs(filters) {
  const cacheKey = `jobs:${JSON.stringify(filters)}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const jobs = await db.query('SELECT * FROM jobs WHERE ...');
  await redis.setex(cacheKey, 3600, JSON.stringify(jobs));
  return jobs;
}
```

#### 3. **API Optimization**

**Pagination**:
```javascript
GET /jobs?page=1&limit=20&sort=match_score
```

**Lazy Loading**:
```javascript
// Only calculate match scores for visible jobs
const visibleJobs = jobs.slice(0, 20);
const scoredJobs = await Promise.all(
  visibleJobs.map(job => addMatchScore(job, userId))
);
```

**Background Jobs**:
```javascript
// Queue match score calculations
await queue.add('calculate-matches', {
  userId,
  jobIds: newJobIds
});
```

#### 4. **Load Balancing**

```
                    ┌─────────────┐
                    │   Nginx     │
                    │ Load Balancer│
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐    ┌─────▼─────┐   ┌─────▼─────┐
    │  Server 1  │    │  Server 2  │   │  Server 3  │
    │  (Fastify) │    │  (Fastify) │   │  (Fastify) │
    └─────┬──────┘    └─────┬──────┘   └─────┬──────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                    ┌───────▼────────┐
                    │   PostgreSQL   │
                    │   (Primary)    │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │   PostgreSQL   │
                    │   (Replica)    │
                    └────────────────┘
```

#### 5. **Performance Targets**

| Metric | Current | Target (10K users) |
|--------|---------|-------------------|
| Job Load Time | 200ms | < 500ms |
| Match Calculation | 2s (50 jobs) | < 1s (paginated) |
| API Response | 100ms | < 200ms |
| Concurrent Users | 1 | 1,000+ |
| Database Queries | N/A | < 50ms (indexed) |

---

## ⚖️ Tradeoffs

### 1. **Mock API vs. Real Job API**

**Current**: Mock job data (50 jobs)

**Tradeoff**:
- ✅ **Pro**: No rate limits, instant responses, guaranteed matches
- ❌ **Con**: Not real-world data, limited variety
- 🔧 **Future**: Integrate Adzuna/JSearch API with caching

### 2. **File Storage vs. Database**

**Current**: File-based (storage.json)

**Tradeoff**:
- ✅ **Pro**: Simple, no setup, works immediately
- ❌ **Con**: Not scalable, no concurrent writes, no queries
- 🔧 **Future**: Migrate to PostgreSQL for multi-user support

### 3. **Client-Side Filtering vs. Server-Side**

**Current**: Hybrid (server filters jobs, client filters match scores)

**Tradeoff**:
- ✅ **Pro**: Fast UI updates, reduces API calls
- ❌ **Con**: Sends all jobs to client (bandwidth)
- 🔧 **Future**: Move all filtering to server with pagination

### 4. **OpenAI vs. Keyword Matching**

**Current**: OpenAI with keyword fallback

**Tradeoff**:
- ✅ **Pro**: Accurate when API available, works without API key
- ❌ **Con**: Slow (1s per job), costs money, quota limits
- 🔧 **Future**: Pre-compute scores, cache aggressively

### 5. **Single User vs. Multi-User**

**Current**: Single user (default_user)

**Tradeoff**:
- ✅ **Pro**: Simpler architecture, faster development
- ❌ **Con**: Not production-ready, no authentication
- 🔧 **Future**: Add JWT auth, user sessions, role-based access

### 6. **Monorepo vs. Separate Repos**

**Current**: Monorepo (client + server in one repo)

**Tradeoff**:
- ✅ **Pro**: Easier development, shared types, single deploy
- ❌ **Con**: Larger repo, coupled deployments
- 🔧 **Future**: Could split for microservices architecture

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **Node.js 16+** - Runtime
- **Fastify** - Web framework
- **pdf-parse** - Resume parsing
- **OpenAI** - AI matching (optional)
- **ioredis** - Redis client (optional)
- **@fastify/multipart** - File uploads
- **@fastify/cors** - CORS handling

### Storage
- **File System** - Default (storage.json)
- **Redis** - Optional (production)

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **dotenv** - Environment variables

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. **Get Jobs**
```http
GET /jobs?search=react&mode=remote&type=fulltime&location=NYC&skills=react,node&datePosted=week&minMatch=70
```

**Query Parameters:**
- `search` (string): Job title search
- `mode` (string): Remote | Hybrid | On-site
- `type` (string): Full-time | Part-time | Contract | Internship
- `location` (string): City/region filter
- `skills` (string): Comma-separated skills
- `datePosted` (string): 24h | week | month | any
- `minMatch` (number): Minimum match score (0-100)

**Response:**
```json
[
  {
    "id": "job-1",
    "title": "Senior React Developer",
    "company": "TechFlow",
    "location": "Remote",
    "type": "Full-time",
    "mode": "Remote",
    "salary": "$120k - $160k",
    "description": "...",
    "skills": ["React", "Node.js", "TypeScript"],
    "posted_at": "2026-01-20T00:00:00.000Z",
    "logo": "https://logo.clearbit.com/techflow.com",
    "match": {
      "score": 95,
      "reason": "Strong match for skills: React, Node.js, TypeScript.",
      "suggestions": ["Consider adding Docker to your portfolio."]
    }
  }
]
```

#### 2. **Upload Resume**
```http
POST /upload-resume
Content-Type: multipart/form-data

resume: <file.pdf>
```

**Response:**
```json
{
  "success": true,
  "textPreview": "Skills: React, Node.js, Python..."
}
```

#### 3. **Get Applications**
```http
GET /applications
```

**Response:**
```json
[
  {
    "id": "app-1",
    "job": { /* job object */ },
    "status": "Applied",
    "appliedAt": "2026-01-22T00:00:00.000Z",
    "updatedAt": "2026-01-22T00:00:00.000Z"
  }
]
```

#### 4. **Record Application**
```http
POST /applications
Content-Type: application/json

{
  "job": { /* job object */ },
  "status": "Applied"
}
```

#### 5. **Update Application**
```http
POST /applications/update
Content-Type: application/json

{
  "jobId": "job-1",
  "status": "Interview"
}
```

#### 6. **Chat with AI**
```http
POST /chat
Content-Type: application/json

{
  "message": "Show me remote React jobs"
}
```

**Response:**
```json
{
  "response": "Based on your profile, the 'Senior React Developer' at TechFlow is a perfect Remote match (95%)..."
}
```

#### 7. **Resume Status**
```http
GET /resume-status
```

**Response:**
```json
{
  "hasResume": true,
  "length": 1234,
  "preview": "Skills: React, Node.js..."
}
```

---

## 📝 License

MIT License - feel free to use this project for learning or portfolio purposes.

---

## 🙏 Acknowledgments

- OpenAI for GPT-3.5-turbo API
- Clearbit for company logo API
- React and Fastify communities

---

## 🚢 Deployment

For detailed instructions on how to deploy this application to production (Railway, Render, or Docker), please refer to our [Deployment Guide](DEPLOYMENT.md).

---

**Built with ❤️ for the AI Job Tracker Assessment**
=======
# AI-Job-Tracker
resume ai analyser
>>>>>>> aae15aa2275a7b94f67992dced970617317937af
