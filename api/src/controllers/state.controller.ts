import { Socket } from 'socket.io';
import { RobotState } from '../models/RobotState';
import logger from '../config/logger';
import data from '../seed.json';
import EV3SerialClient from '../ev3/ev3SerialClient';
import EV3BluetoothClient from '../ev3/ev3BluetoothClient';
import EV3MindstormsClient from '../ev3/ev3MindstormsClient';
import { MotorConfig, MotorPorts } from '../ev3/portConfig';

// var EV3Robot = require('../ev3/node/EV3Robot');
// import EV3Robot from '../ev3/node/EV3Robot';
// const robot = new EV3Robot.Robot();

const bluetoothClient = new EV3MindstormsClient();

// setInterval(() => {
//     const status = bluetoothClient.getConnectionStatus();
//     logger.info('EV3 Connection Status:', status);
// }, 5000);

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
            logger.info(`(State): Moving base motor to ${angle}°`);        
            await bluetoothClient.moveBase(angle);
        }

        // if (newState.nodes.upper_arm?.rotation?.[1] !== undefined) {
        //     const angle = convertToMotorAngle(newState.nodes.upper_arm.rotation[1], 'ELBOW');
        //     logger.info(`(State): Moving elbow motor to ${angle}°`);
        //     await bluetoothClient.moveElbow(angle);
        // }

        // if (newState.nodes.wrist_extension?.rotation?.[1] !== undefined) {
        //     const angle = convertToMotorAngle(newState.nodes.wrist_extension.rotation[1], 'HEIGHT');
        //     logger.info(`(State): Moving height motor to ${angle}°`);
        //     await bluetoothClient.moveHeight(angle);
        // }

        // if (newState.nodes.gripper?.position?.[2] !== undefined) {
        //     const position = convertGripperPosition(newState.nodes.gripper.position[2]);
        //     logger.info(`(State): Moving gripper motor to position ${position}`);
        //     // logger.info(`------------------------------------`);
        //     // logger.info(`=>`, serialClient);
        //     // logger.info(`------------------------------------`);
        //     await bluetoothClient.moveGripper(position);
        // }

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
        // serialClient.calibrateBasePosition()
        //     .catch(error => logger.error('Calibration error:', error));
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
    socket.on("test-motor", async () => {
        logger.info('Test motor command received');
        try {
            // Log connection status
            logger.info('EV3 Status:', bluetoothClient.getStatus());
            
            await bluetoothClient.moveBase(45);
            socket.emit('motor-test-complete', 'Test completed');
        } catch (error) {
            logger.error('Test failed:', error);
            socket.emit('motor-test-error', error.message);
        }
    });
}