// @ts-nocheck
import { Robot } from '@types';
import { Euler } from 'three';

export const calculateRobotTransforms = {
  upperArm: (currentHeight: number, initialHeight: number) => {
    const heightChange = currentHeight - initialHeight;
    return heightChange * 90 * -1 * 2;
  },

  gripper: (currentPosition: number, initialPosition: number) => {
    const positionChange = currentPosition - initialPosition;
    return (positionChange * (140/0.4)) - 70;
  },

  mainColumn: (currentPositions: number[], startRotation: number) => {
    const euler = new Euler().fromArray(currentPositions);
    const endDegrees = (euler.y * 180) / Math.PI;
    const totalRotation = endDegrees - (startRotation || 0);
    return totalRotation * 4 * -1;
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