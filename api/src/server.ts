// In src/server.ts

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

// Create Socket.IO instance with debug
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
    logger.info('=== New Socket Connection ===');
    logger.info('Socket ID:', socket.id);
    logger.info('Transport:', socket.conn.transport.name);

    socket.onAny((event, ...args) => {
        logger.info(`Incoming event "${event}":`, args);
    });

    stateController(socket);
});

// Initialize the application
async function initializeApp() {
    try {
        await seed();
        logger.info('Seed check completed');

        // Socket.IO connection handling with detailed logging
        io.on('connection', (socket) => {
            logger.info('=== New Socket Connection ===');
            logger.info('Socket ID:', socket.id);
            logger.info('Transport:', socket.conn.transport.name);
            logger.info('Headers:', socket.handshake.headers);

            socket.onAny((event, ...args) => {
                logger.info(`Socket Event "${event}":`, args);
            });

            socket.on('error', (error) => {
                logger.error(`Socket Error (${socket.id}):`, error);
            });

            socket.on('disconnect', (reason) => {
                logger.info(`Socket Disconnected (${socket.id}):`, reason);
            });

            // Initialize state controller
            stateController(socket);
        });

        const PORT = process.env.PORT || 4000;
        
        httpServer.listen(PORT, () => {
            logger.info(`=== Server Started ===`);
            logger.info(`Port: ${PORT}`);
            logger.info(`CORS Origin: http://localhost:3000`);
            logger.info(`Socket.IO transports: websocket, polling`);
        });

    } catch (err) {
        logger.error('Server initialization error:', err);
        process.exit(1);
    }
}

// Error handling
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', reason);
});

initializeApp();

export default app;