import { Socket } from 'socket.io';
import { RobotState } from '../models/RobotState';
import logger from '../config/logger';
import data from '../seed.json';
import EV3SerialClient from '../ev3/ev3SerialClient';
import { MotorConfig, MotorPorts } from '../ev3/portConfig';

const serialClient = new EV3SerialClient();

setInterval(() => {
    const status = serialClient.getConnectionStatus();
    logger.info('EV3 Connection Status:', status);
}, 5000);

const convertToMotorAngle = (radians: number, motorType: keyof typeof MotorPorts): number => {
    let degrees = (radians * 180) / Math.PI;
    const config = MotorConfig[MotorPorts[motorType]];
    return Math.max(
        config.minDegrees,
        Math.min(config.maxDegrees, degrees)
    );
};

const convertGripperPosition = (position: number): number => {
    const config = MotorConfig[MotorPorts.GRIPPER];
    const percentage = ((position + 1) / 2) * 100;
    return Math.max(
        config.minDegrees,
        Math.min(config.maxDegrees, percentage)
    );
};

const handleH25Movements = async (newState: any) => {
    if (!newState.nodes) return;

    try {
        if (newState.nodes.main_column?.rotation?.[1] !== undefined) {
            const angle = convertToMotorAngle(newState.nodes.main_column.rotation[1], 'BASE');
            logger.info(`Moving base motor to ${angle}°`);        
            await serialClient.moveBase(angle);
        }

        if (newState.nodes.upper_arm?.rotation?.[1] !== undefined) {
            const angle = convertToMotorAngle(newState.nodes.upper_arm.rotation[1], 'ELBOW');
            logger.info(`Moving elbow motor to ${angle}°`);
            await serialClient.moveElbow(angle);
        }

        if (newState.nodes.wrist_extension?.rotation?.[1] !== undefined) {
            const angle = convertToMotorAngle(newState.nodes.wrist_extension.rotation[1], 'HEIGHT');
            logger.info(`Moving height motor to ${angle}°`);
            await serialClient.moveHeight(angle);
        }

        if (newState.nodes.gripper?.position?.[2] !== undefined) {
            const position = convertGripperPosition(newState.nodes.gripper.position[2]);
            logger.info(`Moving gripper motor to position ${position}`);
            // logger.info(`------------------------------------`);
            // logger.info(`=>`, serialClient);
            // logger.info(`------------------------------------`);
            await serialClient.moveGripper(position);
        }

    } catch (error) {
        logger.error('Error handling H25 movements:', error);
    }
};

const getState = async (socket: Socket) => {
    const state = await RobotState.findOne();
    logger.info('state =>', state);
    socket.emit('state', state);
};

export const seed = async () => {
    const state = await RobotState.find();
    if (state.length === 0) {
        logger.info('seeding');
        // @ts-ignore
        await RobotState.insertMany(data);
    } else {
        logger.info('not seeding');
    }
};

export default function (socket: Socket) {
    logger.info('===============================');
    logger.info('Socket connection initialized');
    logger.info('Socket ID:', socket.id);
    
    // Immediate test message
    socket.emit('server-test', 'Testing socket connection');
    logger.info('Test message sent to client');

    socket.onAny((eventName, ...args) => {
        logger.info(`Received event "${eventName}":`, args);
    });

    // Listen for specific events
    socket.on('client-test', (data) => {
        logger.info('Received from client:', data);
        socket.emit('server-response', 'Server received your message');
    });

    socket.on('connect', () => {
        logger.info('Client connected event fired');
        serialClient.calibrateBasePosition()
            .catch(error => logger.error('Calibration error:', error));
    });

    socket.on("state:update", async (newState: any) => {
        logger.info('Received state update');
        try {
            await RobotState.findOneAndUpdate({}, newState);
            socket.emit('state', newState);
            await handleH25Movements(newState);
        } catch (error) {
            logger.error('Error updating state:', error);
            socket.emit('error', { message: 'Failed to update robot state' });
        }
    });

    socket.on("state:get", () => {
        logger.info('Received state:get request');
        getState(socket);
    });

    socket.on("disconnect", () => {
        logger.info('Client disconnected:', socket.id);
    });

    // Test motor handler
    socket.on('test-motor', () => {
        logger.info('Test motor event received');
        try {
            serialClient.moveBase(45).then(() => {
                logger.info('Motor movement completed');
                socket.emit('motor-test-complete');
            }).catch(error => {
                logger.error('Motor movement failed:', error);
                socket.emit('motor-test-error', error.message);
            });
        } catch (error) {
            logger.error('Error in test motor handler:', error);
        }
    });
}