require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const path = require('path');

// Register CORS
fastify.register(require('@fastify/cors'), {
    origin: true // Allow all for dev
});

// Register Multipart for file uploads
fastify.register(require('@fastify/multipart'), {
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// Register Routes
fastify.register(require('./src/routes/api'), { prefix: '/api' });

// Register Static Files (Frontend)
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '../client/dist'),
    prefix: '/',
});

// API Health Check moved to /api/health or keep /api/ for basic check if needed
fastify.get('/api/health', async (request, reply) => {
    return { status: 'ok', server: 'Job Tracker AI' };
});

// SPA Fallback: Serve index.html for any 404 that is NOT an API request
fastify.setNotFoundHandler((request, reply) => {
    if (request.raw.url && request.raw.url.startsWith('/api')) {
        reply.code(404).send({ error: 'API Endpoint Not Found' });
        return;
    }
    reply.sendFile('index.html');
});

const start = async () => {
    try {
        const PORT = process.env.PORT || 3000;
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server listening on ${PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
