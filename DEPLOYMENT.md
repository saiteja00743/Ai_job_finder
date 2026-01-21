# Deployment Guide: AI Job Tracker

This guide explains how to deploy the AI Job Tracker to a production environment. The application is designed to be deployed as a single unit where the Node.js backend serves the React frontend.

## 🚀 Recommended Platforms

| Platform | Best For | Ease of Use |
| :------- | :------- | :---------- |
| **Railway** | Full-stack deployment (Redis support) | ⭐⭐⭐⭐⭐ |
| **Render** | Simple free-tier hosting | ⭐⭐⭐⭐ |
| **Vercel** | Frontend-only (needs backend elsewhere) | ⭐⭐⭐ |

---

## 🏗️ Deployment Strategy: Unified Build

We will build the React frontend into static files and use Fastify to serve them.

### Step 1: Preparation (Local)

1.  **Build the Frontend:**
    ```bash
    cd client
    npm install
    npm run build
    ```
    This creates a `dist` folder inside the `client` directory.

2.  **Verify Server Configuration:**
    Ensure `server/server.js` has the static file registration:
    ```javascript
    fastify.register(require('@fastify/static'), {
        root: path.join(__dirname, '../client/dist'),
        prefix: '/',
    });
    ```

3.  **Start the Production Server:**
    ```bash
    cd ../server
    npm install
    npm start
    ```

---

## 🚂 Deploying to Railway (Recommended)

Railway is the easiest platform because it supports integrated storage (Redis) and monorepos.

1.  **Create a New Project** on [Railway.app](https://railway.app/).
2.  **Connect your GitHub Repository**.
3.  **Set Environment Variables:**
    - `PORT`: 3000
    - `OPENAI_API_KEY`: your_key (optional)
    - `REDIS_URL`: (Railway will provide this if you add a Redis service)
4.  **Set Build & Start Commands:**
    - **Root Directory:** `/` (the root of your project)
    - **Build Command:** `cd client && npm install && npm run build && cd ../server && npm install`
    - **Start Command:** `cd server && node server.js`

---

## ☁️ Deploying to Render

Render is a great free alternative.

1.  **Create a New Web Service** on [Render.com](https://render.com/).
2.  **Connect your GitHub Repository**.
3.  **Configure Service Settings:**
    - **Runtime:** `Node`
    - **Build Command:** `npm install && cd client && npm install && npm run build`
    - **Start Command:** `cd server && node server.js`
4.  **Add Environment Variables:**
    - Click "Advanced" -> "Add Environment Variable"
    - `OPENAI_API_KEY`
    - `REDIS_URL`

---

## 🐳 Deploying with Docker (Advanced)

If you have a VPS (DigitalOcean, AWS, etc.), use Docker.

1.  **Create a `Dockerfile`** in the root:
    ```dockerfile
    # Stage 1: Build Frontend
    FROM node:18-alpine AS frontend-builder
    WORKDIR /app/client
    COPY client/package*.json ./
    RUN npm install
    COPY client/ ./
    RUN npm run build

    # Stage 2: Final Image
    FROM node:18-alpine
    WORKDIR /app
    COPY server/package*.json ./server/
    RUN cd server && npm install
    COPY server/ ./server/
    COPY --from=frontend-builder /app/client/dist ./client/dist
    
    EXPOSE 3000
    CMD ["node", "server/server.js"]
    ```

2.  **Build and Run:**
    ```bash
    docker build -t ai-job-tracker .
    docker run -p 3000:3000 ai-job-tracker
    ```

---

## ⚠️ Important Considerations

1.  **Environment Variables:** Always set your `OPENAI_API_KEY` and `REDIS_URL` in the deployment platform's dashboard, never hardcode them.
2.  **Redis Persistence:** Free tiers often clear in-memory storage. Use a Redis database (offered by Railway/Render) for permanent resume and application storage.
3.  **CORS:** In production, you might want to restrict CORS origins to your actual domain.
4.  **Scaling:** The app uses file-based storage by default if Redis isn't provided. **File-based storage will NOT work on platforms like Heroku/Vercel** because their file systems are ephemeral (deleted on restart). Always use Redis for production deployments.

---

## 🛠️ Performance Optimization

- The frontend is optimized using Vite (Rollup).
- The backend uses Fastify, one of the fastest Node.js frameworks.
- Static files are compressed and served with high-performance headers.

**Status:** ✅ Ready for Deployment
