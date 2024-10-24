import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import path from 'path';

enum NodeName {
    mainColumn = 'main_column',
    upperArm = 'upper_arm',
    wristExtension = 'wrist_extension',
    hand = 'hand',
    gripper = 'gripper'
}

export interface RobotNode {
    position: [number, number, number];
    scale: [number, number, number];
    rotation?: [number, number, number];
}

export interface RobotStateDocument {
    nodes: {
        [NodeName.mainColumn]: RobotNode;
        [NodeName.upperArm]: RobotNode;
        [NodeName.wristExtension]: RobotNode;
        [NodeName.hand]: RobotNode;
        [NodeName.gripper]: RobotNode;
    };
}

const adapter = new FileSync<{ robotState: RobotStateDocument[] }>(
    path.join(__dirname, '../data/db.json')
);
const db = low(adapter);

// Initialize db with default data if empty
db.defaults({ robotState: [] }).write();

export const RobotState = {
    findOne: async (): Promise<RobotStateDocument | null> => {
        const state = db.get('robotState').first().value();
        return state || null;
    },

    findOneAndUpdate: async (
        query: any,
        update: RobotStateDocument
    ): Promise<RobotStateDocument | null> => {
        db.get('robotState')
            .find(query)
            .assign(update)
            .write();
        return update;
    },

    insertMany: async (documents: RobotStateDocument[]): Promise<void> => {
        db.get('robotState')
            .push(...documents)
            .write();
    },

    find: async (): Promise<RobotStateDocument[]> => {
        return db.get('robotState').value();
    }
};