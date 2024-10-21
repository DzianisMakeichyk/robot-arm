 
import mongoose from "mongoose"

enum NodeName {
    mainColumn = 'main_column',
    upperArm = 'upper_arm',
    wristExtension = 'wrist_extension',
    hand = 'hand',
    gripper = 'gripper'
}

export interface RobotNode {
    position: [number, number, number],
    scale: [number, number, number]
    rotation?: [number, number, number]
}

export type RobotStateDocument = mongoose.Document & {
    nodes: {
        [NodeName.mainColumn]: RobotNode
        [NodeName.upperArm]: RobotNode
        [NodeName.wristExtension]: RobotNode
        [NodeName.hand]: RobotNode
        [NodeName.gripper]: RobotNode
    }
}

const robotStateSchema = new mongoose.Schema<RobotStateDocument>(
    {
        nodes: {
            [NodeName.mainColumn]: {
                position: Array<number>,
                scale: Array<number>,
                rotation: { type: Array<number>, required: false }
            },
            [NodeName.upperArm]: {
                position: Array<number>,
                scale: Array<number>,
                rotation: { type: Array<number>, required: false }
            },
            [NodeName.wristExtension]: {
                position: Array<number>,
                scale: Array<number>,
                rotation: { type: Array<number>, required: false }
            },
            [NodeName.hand]: {
                position: Array<number>,
                scale: Array<number>,
                rotation: { type: Array<number>, required: false }
            },
            [NodeName.gripper]: {
                position: Array<number>,
                scale: Array<number>,
                rotation: { type: Array<number>, required: false }
            }
        }
    },
    {
        timestamps: true
    }
)

export const RobotState = mongoose.model<RobotStateDocument>("RobotState", robotStateSchema)
