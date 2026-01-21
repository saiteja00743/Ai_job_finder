# Job Tracker AI - Deployment Guide

## Overview
This application is a full-stack Web App using:
- **Frontend**: React (Vite)
- **Backend**: Node.js (Fastify)
- **Database**: Redis (optional, falls back to in-memory)
- **AI**: OpenAI (requires key)

## Prerequisites
- Node.js (v18+)
- Redis (optional)

## Project Structure
- `client/`: React frontend
- `server/`: Fastify backend

## Local Development
1. **Install Dependencies**:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
2. **Setup Environment**:
   - Create `server/.env` based on `server/.env.example` (or just set `OPENAI_API_KEY`).
   - `REDIS_URL` is optional.
3. **Run Dev**:
   - Terminal 1 (Server): `cd server && npm start`
   - Terminal 2 (Client): `cd client && npm run dev`

## Production Deployment (Self-Hosted / Single Server)
The server is configured to serve the frontend static files. This allows you to deploy the entire app as a single Node.js service.

1. **Build Frontend**:
   ```bash
   cd client
   npm run build
   ```
   This creates a `dist` folder in `client/`.

2. **Start Server**:
   ```bash
   cd server
   npm start
   ```
   Access the app at `http://localhost:3000`.

## Cloud Deployment (e.g., Render, Railway, Heroku)
Since this is a monorepo-style setup, you can deploy the `server` directory, but you must ensure the `client/dist` is available.

**Strategy: Build on Deploy**
1. Set the **Root Directory** to `.` (project root).
2. **Build Command**: 
   ```bash
   cd client && npm install && npm run build && cd ../server && npm install
   ```
3. **Start Command**:
   ```bash
   cd server && node server.js
   ```
4. **Environment Variables**:
   - `OPENAI_API_KEY`: Your key.
   - `REDIS_URL`: Your Redis connection string (if using Redis).

## Features
- **Job Listing**: Mock data + Search/Filter.
- **Resume Upload**: Parses PDF/Text and stores in memory/Redis.
- **AI Matching**: Scores resume against jobs (Mocked if no API key).
- **Application Tracking**: Kanban-style status updates.
