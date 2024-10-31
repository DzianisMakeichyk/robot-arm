const express = require('express');
const { Server } = require('socket.io');
const { createServer } = require('http');
const ev3dev = require('ev3dev-lang');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Initialize motor A
const motorA = new ev3dev.Motor('outA');

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('test:motorA', () => {
        try {
            console.log('Testing Motor A');
            motorA.runToRelativePosition(90, 50); // 90 degrees at 50% speed
        } catch (error) {
            console.error('Motor error:', error);
            socket.emit('error', { message: 'Motor test failed' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = 4000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});