import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import logger from './config/logger';
import stateController, { seed } from './controllers/state.controller';

const app = express();
const httpServer = createServer(app);

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Create Socket.IO instance
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

async function initializeApp() {
    try {
        await seed();
        logger.info('Seed check completed');

        // Socket.IO connection handling
        io.on('connection', (socket) => {
            logger.info(`New client connected: ${socket.id}`);

            socket.on('error', (error) => {
                logger.error(`Socket error for ${socket.id}:`, error);
            });

            stateController(socket);
        });

        const PORT = process.env.PORT || 4000;
        
        httpServer.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

    } catch (err) {
        logger.error('Server initialization error:', err);
        process.exit(1);
    }
}

// Handle process events
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', reason);
});

process.on('SIGINT', () => {
    logger.info('Shutting down server...');
    process.exit(0);
});

initializeApp();

export default app;