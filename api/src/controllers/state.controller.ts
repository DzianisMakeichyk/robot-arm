import { Socket } from 'socket.io';
import { RobotState } from '../models/RobotState';
import logger from '../config/logger';
import data from '../seed.json';
import MacBluetoothClient from '../ev3/macBluetoothClient';

// Create a single instance of the Bluetooth client
const bluetoothClient = new MacBluetoothClient();

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
 * Handle movement commands based on state updates
 */
const handleMovements = async (newState: any) => {
    if (!newState.nodes) return;

    try {
        // Handle main column rotation
        if (newState.nodes.main_column?.rotation?.[1] !== undefined) {
            await bluetoothClient.moveMainColumn(newState.nodes.main_column.rotation[1]);
        }

        // Handle upper arm rotation
        if (newState.nodes.upper_arm?.rotation?.[1] !== undefined) {
            await bluetoothClient.moveUpperArm(newState.nodes.upper_arm.rotation[1]);
        }

        // Handle wrist rotation
        if (newState.nodes.wrist_extension?.rotation?.[1] !== undefined) {
            await bluetoothClient.moveWrist(newState.nodes.wrist_extension.rotation[1]);
        }

        // Handle gripper movement
        if (newState.nodes.gripper?.position?.[2] !== undefined) {
            await bluetoothClient.moveGripper(newState.nodes.gripper.position[2]);
        }
    } catch (error) {
        logger.error('Error handling movements:', error);
    }
};

/**
 * Map the websocket events to controller methods
 */
export default function (socket: Socket) {
    socket.on("state:update", async (newState: any) => {
        try {
            await RobotState.findOneAndUpdate({}, newState);
            socket.emit('state', newState);
            logger.info('State updated:', newState);

            // Handle robot movements
            await handleMovements(newState);

        } catch (error) {
            logger.error('Error updating state:', error);
        }
    });

    socket.on("state:get", () => getState(socket));

    // Clean up Bluetooth connection when socket disconnects
    socket.on("disconnect", async () => {
        try {
            await bluetoothClient.disconnect();
            logger.info('Bluetooth client disconnected due to socket disconnect');
        } catch (error) {
            logger.error('Error disconnecting Bluetooth client:', error);
        }
    });
}