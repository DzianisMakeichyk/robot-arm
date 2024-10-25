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

const testDB: any = {
    "nodes": {
      "main_column": {
        "position": [0, 1.462, 0],
        "scale": [1, 1, 1],
        "rotation": []
      },
      "upper_arm": {
        "position": [2.335, 0, 0.094],
        "scale": [0.684, 1, 1],
        "rotation": []
      },
      "wrist_extension": {
        "position": [3.231, 6.551, 0.007],
        "scale": [0.264, 0.264, 0.264],
        "rotation": []
      },
      "hand": {
        "position": [3.368, 5.728, -0.119],
        "scale": [1, 0.068, 0.327],
        "rotation": [0, 1.5708, 0]
      },
      "gripper": {
        "position": [3.33, 5.545, 0.006],
        "scale": [-0.01, -0.132, -0.325],
        "rotation": [0, 1.5708, 0]
      }
    }
  }

// Initialize db with default data if empty
db.defaults({ robotState: [] }).write();

export const RobotState = {
    findOne: async (): Promise<RobotStateDocument | null> => {
        // const state = db.get('robotState').first().value();
        const state = testDB;
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