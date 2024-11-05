// @ts-nocheck
import { Robot } from '@types';
import { Euler } from 'three';

export const calculateRobotTransforms = {
  upperArm: (currentHeight: number, initialHeight: number) => {
    const heightChange = currentHeight - initialHeight;
    // Gear ratio is 6:1 and direction is reversed
    const gearRatioElbow = 6;
    // Height ratio is 30:1 and direction is reversed
    const heightRatioElbow = 30;
    const direction = -1;

    return heightChange * heightRatioElbow * direction * gearRatioElbow;
  },

  gripper: (currentPosition: number, initialPosition: number) => {
    // Gdy gripper przesunie się z 0 do 0.4 (cały zakres):
    const change = 0.4 - 0;
    const totalRange = 140;
    const positionChange = currentPosition - initialPosition;
    
    return (positionChange * (totalRange/change)) - totalRange/2;
  },

  mainColumn: (currentPositions: number[], startRotation: number) => {
    const euler = new Euler().fromArray(currentPositions);
    const endDegrees = (euler.y * 180) / Math.PI;
    const totalRotation = endDegrees - (startRotation || 0);
    // Gear ratio is 4:1 and direction is reversed
    const gearRatioBase = 4;
    const direction = -1;

    return totalRotation * gearRatioBase * direction;
  }
};

export const createNodeUpdate = (nodeName: string, data: Robot.RobotNodes, rotationDegrees: number): Partial<Robot.RobotNodes> => {
  const ev3Data: Partial<Robot.RobotNodes> = {
    nodes: {
      ...data.nodes
    }
  };

  Object.keys(ev3Data.nodes).forEach((key) => {
    if (key === nodeName) {
      ev3Data.nodes[key] = {
        ...data.nodes[key],
        position: data.nodes[key].position,
        scale: data.nodes[key].scale,
        rotation: data.nodes[key].rotation,
        rotationDegrees,
        _updated: true
      };
    } else {
      ev3Data.nodes[key] = {
        ...data.nodes[key],
        _updated: false
      };
    }
  });

  return ev3Data;
};