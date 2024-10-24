 
import {Socket} from 'socket.io/dist/socket'
import {RobotState} from '../models/RobotState'
import logger from '../config/logger'
import data from '../seed.json'
import EV3Client from '../ev3/ev3Client';

const ev3Client = new EV3Client();

/**
 * Retrieve the current state of the Robot
 *
 * @param socket Socket to respond on
 */
const getState = async (socket: Socket) => {
    const state = await RobotState.findOne({})
    // const ev3Position = ev3Client.getCurrentPosition();
    
    // if (state && state.nodes) {
    //     state.nodes.main_column.rotation[1] = ev3Position.mainColumn;
    //     state.nodes.upper_arm.rotation[1] = ev3Position.upperArm;
    //     state.nodes.wrist_extension.rotation[1] = ev3Position.wrist;
    //     state.nodes.gripper.position[2] = ev3Position.gripper;
    // }
    
    logger.info('state =>', state)
    socket.emit('state', state)
}

/**
 * Adding some initial seed data at startup if collection is empty
 */
export const seed = async () => {
    const state = await RobotState.find({})

    if (state.length === 0) {
        logger.info('seeding')
        await RobotState.insertMany(data)
    } else {
        logger.info('not seeding')
    }
}

/**
 * Map the websocket events to controller methods
 *
 * @param socket Socket to respond to
 */
export default function (socket: Socket, io: Socket) {
    socket.on("state:update", async (newState: any) => {
        try {
            await RobotState.findOneAndUpdate({}, newState, {upsert: true})
            io.emit('state', newState)  // Broadcast the new state to all connected clients
            logger.info('State updated:', newState)

            // Move EV3 robot
            // if (newState.nodes) {
            //     if (newState.nodes.main_column) {
            //         ev3Client.moveMainColumn(newState.nodes.main_column.rotation[1]);
            //     }
            //     if (newState.nodes.upper_arm) {
            //         ev3Client.moveUpperArm(newState.nodes.upper_arm.rotation[1]);
            //     }
            //     if (newState.nodes.wrist_extension) {
            //         ev3Client.moveWrist(newState.nodes.wrist_extension.rotation[1]);
            //     }
            //     if (newState.nodes.gripper) {
            //         ev3Client.moveGripper(newState.nodes.gripper.position[2]);
            //     }
            // }

            // v2
            // if (newState.nodes) {
            //     if (newState.nodes.main_column && newState.nodes.main_column.rotation) {
            //         const angle = Math.round(newState.nodes.main_column.rotation[1] * (180/Math.PI));
            //         await ev3Client.moveMainColumn(angle);
            //     }
                
            //     if (newState.nodes.upper_arm && newState.nodes.upper_arm.rotation) {
            //         const angle = Math.round(newState.nodes.upper_arm.rotation[1] * (180/Math.PI));
            //         await ev3Client.moveUpperArm(angle);
            //     }
                
            //     if (newState.nodes.wrist_extension && newState.nodes.wrist_extension.rotation) {
            //         const angle = Math.round(newState.nodes.wrist_extension.rotation[1] * (180/Math.PI));
            //         await ev3Client.moveWrist(angle);
            //     }
                
            //     if (newState.nodes.gripper && newState.nodes.gripper.position) {
            //         const distance = Math.round(newState.nodes.gripper.position[2] * 360);
            //         await ev3Client.moveGripper(distance);
            //     }
            // }
        } catch (error) {
            logger.error('Error updating state:', error)
        }
    })
    socket.on("state:get", () => getState(socket))
}
