import { Socket } from 'socket.io';
import { RobotState } from '../models/RobotState';
import logger from '../config/logger';
import data from '../seed.json';
import MacBluetoothClient from '../ev3/macBluetoothClient';
import { MotorConfig, MotorPorts } from '../ev3/portConfig';

const bluetoothClient = new MacBluetoothClient();

/**
 * Convert 3D model rotations to H25 motor angles
 */
const convertToMotorAngle = (radians: number, motorType: keyof typeof MotorPorts): number => {
    // Convert radians to degrees
    let degrees = (radians * 180) / Math.PI;
    
    // Get motor configuration
    const config = MotorConfig[MotorPorts[motorType]];
    
    // Clamp to motor limits
    return Math.max(
        config.minDegrees,
        Math.min(config.maxDegrees, degrees)
    );
};

/**
 * Convert gripper position to motor angle
 */
const convertGripperPosition = (position: number): number => {
    const config = MotorConfig[MotorPorts.GRIPPER];
    // Convert position value to percentage (0-100)
    const percentage = ((position + 1) / 2) * 100;
    return Math.max(
        config.minDegrees,
        Math.min(config.maxDegrees, percentage)
    );
};

/**
 * Handle H25 robot movements based on 3D model state
 */
const handleH25Movements = async (newState: any) => {
    if (!newState.nodes) return;

    try {
        // Base rotation (main_column in 3D model maps to BASE motor)
        if (newState.nodes.main_column?.rotation?.[1] !== undefined) {
            const angle = convertToMotorAngle(newState.nodes.main_column.rotation[1], 'BASE');
            logger.info(`Moving base motor to ${angle}°`);
            await bluetoothClient.moveBase(angle);
        }

        // Elbow movement (upper_arm in 3D model maps to ELBOW motor)
        if (newState.nodes.upper_arm?.rotation?.[1] !== undefined) {
            const angle = convertToMotorAngle(newState.nodes.upper_arm.rotation[1], 'ELBOW');
            logger.info(`Moving elbow motor to ${angle}°`);
            await bluetoothClient.moveElbow(angle);
        }

        // Height adjustment (wrist_extension in 3D model maps to HEIGHT motor)
        if (newState.nodes.wrist_extension?.rotation?.[1] !== undefined) {
            const angle = convertToMotorAngle(newState.nodes.wrist_extension.rotation[1], 'HEIGHT');
            logger.info(`Moving height motor to ${angle}°`);
            await bluetoothClient.moveHeight(angle);
        }

        // Gripper control
        if (newState.nodes.gripper?.position?.[2] !== undefined) {
            const position = convertGripperPosition(newState.nodes.gripper.position[2]);
            logger.info(`Moving gripper motor to position ${position}`);
            await bluetoothClient.moveGripper(position);
        }

    } catch (error) {
        logger.error('Error handling H25 movements:', error);
    }
};

/**
 * Retrieve the current state of the Robot
 */
const getState = async (socket: Socket) => {
    const state = await RobotState.findOne();
    logger.info('state =>', state);
    socket.emit('state', state);
};

/**
 * Adding some initial seed data at startup if collection is empty
 */
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

/**
 * Map the websocket events to controller methods
 */
export default function (socket: Socket) {
    // Handle initial connection
    socket.on('connect', () => {
        logger.info('Client connected, initializing H25 robot arm...');
        bluetoothClient.calibrateBasePosition()
            .catch(error => logger.error('Calibration error:', error));
    });

    // Handle state updates
    socket.on("state:update", async (newState: any) => {
        try {
            // logger.info('Received state update:', newState);
            await RobotState.findOneAndUpdate({}, newState);
            socket.emit('state', newState);
            // logger.info('State updated and emitted back');

            // Handle H25 movements
            await handleH25Movements(newState);

        } catch (error) {
            logger.error('Error updating state:', error);
            socket.emit('error', { message: 'Failed to update robot state' });
        }
    });

    // Handle state requests
    socket.on("state:get", () => {
        logger.info('Received state:get request');
        getState(socket);
    });

    // Handle calibration requests
    socket.on("calibrate", async () => {
        try {
            await bluetoothClient.calibrateBasePosition();
            socket.emit('calibration_complete');
        } catch (error) {
            logger.error('Calibration error:', error);
            socket.emit('error', { message: 'Calibration failed' });
        }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
        try {
            // await bluetoothClient.disconnect();
            logger.info('NOOOOOOO:','Client disconnected, shutting down H25 connection');
        } catch (error) {
            logger.error('Error during disconnect:', error);
        }
    });
}