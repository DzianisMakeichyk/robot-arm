import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import logger from './config/logger';
import stateController, { seed } from './controllers/state.controller';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// Enable CORS
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
}));

// Create Socket.IO instance
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Initialize the application
async function initializeApp() {
    try {
        await seed();
        logger.info('Seed check completed');

        // Socket.IO connection handling
        io.on('connection', (socket) => {
            logger.info(`New client connected: ${socket.id}`);

            // Debugging socket events
            // socket.onAny((event, ...args) => {
            //     logger.info(`Received event "${event}":`, args);
            // });

            socket.on('error', (error) => {
                logger.error(`Socket error for ${socket.id}:`, error);
            });

            socket.on('disconnect', (reason) => {
                logger.info(`Client ${socket.id} disconnected: ${reason}`);
            });

            stateController(socket);
        });

        const PORT = process.env.PORT || 4000;
        
        httpServer.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`WebSocket server URL: ws://localhost:${PORT}`);
            logger.info(`HTTP server URL: http://localhost:${PORT}`);
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

initializeApp();

export default app;