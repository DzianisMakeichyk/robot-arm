// @ts-nocheck
import {Gizmo} from '@components/gizmo'
import {useGLTF} from '@react-three/drei'
import {Robot} from '@types'
import Mesh from "@components/mesh/Mesh"
import { useState } from 'react';
import { Euler } from 'three';

interface RobotProps {
    data: Robot.RobotNodes;
    onUpdate: (newData: Partial<Robot.RobotNodes>) => void;
}

export const RobotArm = ({data, onUpdate}: RobotProps) => {
    const {nodes} = useGLTF('/robot.glb') as unknown as Robot.DreiGLTF;
    const node = Robot.NodeName;
    const [startRotation, setStartRotation] = useState<{[key: string]: number}>({});
    const [startPosition, setStartPosition] = useState<{[key: string]: number}>({});
    const [currentPositions, setCurrentPositions] = useState<{[key: string]: number}>({});
    const [currentRotations, setCurrentRotations] = useState<{[key: string]: [number, number, number]}>({
        [node.mainColumn]: [0,0,0],
        [node.upperArm]: [0,0,0],
        [node.gripper]: [0,0,0]
    });
    
    const handleGizmoUpdate = (nodeName: Robot.NodeName, transform: { position: [number, number, number], rotation: [number, number, number] }) => {
        if (nodeName === node.upperArm) {
            const height = transform.position[1];
            setCurrentPositions(prev => ({
                ...prev,
                [nodeName]: height
            }));
            console.log(`Current height for ${nodeName}:`, height);
        } else if (nodeName === node.gripper) {
            const position = transform.position[2]; // Use Z axis for gripper
            setCurrentPositions(prev => ({
                ...prev,
                [nodeName]: position
            }));
            console.log(`Current position for ${nodeName}:`, position);
        } else {
            setCurrentRotations(prev => ({
                ...prev,
                [nodeName]: transform.rotation
            }));
            const euler = new Euler().fromArray(transform.rotation);
            const currentDegrees = (euler.y * 180) / Math.PI;
            console.log(`Current rotation for ${nodeName}:`, currentDegrees);
        }
    };

    const handleDragStart = (nodeName: Robot.NodeName, transform: { position: [number, number, number], rotation: [number, number, number] }) => {
        if (nodeName === node.upperArm) {
            setStartPosition(prev => ({
                ...prev,
                [nodeName]: transform.position[1]
            }));
            setCurrentPositions(prev => ({
                ...prev,
                [nodeName]: transform.position[1]
            }));
            console.log(`Start height for ${nodeName}:`, transform.position[1]);
        } else if (nodeName === node.gripper) {
            setStartPosition(prev => ({
                ...prev,
                [nodeName]: transform.position[2]
            }));
            setCurrentPositions(prev => ({
                ...prev,
                [nodeName]: transform.position[2]
            }));
            console.log(`Start position for ${nodeName}:`, transform.position[2]);
        } else {
            const euler = new Euler().fromArray(transform.rotation);
            const degrees = (euler.y * 180) / Math.PI;
            setStartRotation(prev => ({
                ...prev,
                [nodeName]: degrees
            }));
            console.log(`Start rotation for ${nodeName}:`, degrees);
        }
    };

    const handleDragEnd = (nodeName: Robot.NodeName) => {
        const newData: Partial<Robot.RobotNodes> = {
            nodes: {
                ...data.nodes,
            }
        };

        if (nodeName === node.upperArm) {
            const currentHeight = currentPositions[nodeName] || 0;
            const initialHeight = startPosition[nodeName] || 0;
            const heightChange = currentHeight - initialHeight;
            const angleChange = heightChange * 90;

            console.log("==>> currentHeight:", currentHeight);
            console.log("==>> initialHeight:", initialHeight);
            console.log("==>> heightChange:", heightChange);
            console.log("==>> angleChange:", angleChange);

            newData.nodes[nodeName] = {
                ...data.nodes[nodeName],
                position: [data.nodes[nodeName].position[0], currentHeight, data.nodes[nodeName].position[2]],
                scale: data.nodes[nodeName].scale,
                rotation: data.nodes[nodeName].rotation,
                rotationDegrees: angleChange,
                _updated: true
            };

            console.log(`Sending height change as angle for ${nodeName}:`, angleChange);
        } else if (nodeName === node.gripper) {
            const currentPosition = currentPositions[nodeName] || 0;
            const initialPosition = startPosition[nodeName] || 0;
            const positionChange = currentPosition - initialPosition;
            const angleChange = positionChange * 90;

            console.log("==>> currentPosition:", currentPosition);
            console.log("==>> initialPosition:", initialPosition);
            console.log("==>> positionChange:", positionChange);
            console.log("==>> angleChange:", angleChange);

            newData.nodes[nodeName] = {
                ...data.nodes[nodeName],
                position: [data.nodes[nodeName].position[0], data.nodes[nodeName].position[1], currentPosition],
                scale: data.nodes[nodeName].scale,
                rotation: data.nodes[nodeName].rotation,
                rotationDegrees: angleChange,
                _updated: true
            };

            console.log(`Sending position change as angle for ${nodeName}:`, angleChange);
        } else {
            const euler = new Euler().fromArray(currentRotations[nodeName]);
            const endDegrees = (euler.y * 180) / Math.PI;
            let totalRotation = endDegrees - (startRotation[nodeName] || 0);

            if (nodeName === node.mainColumn) {
                totalRotation *= 4;
            }

            newData.nodes[nodeName] = {
                ...data.nodes[nodeName],
                position: data.nodes[nodeName].position,
                scale: data.nodes[nodeName].scale,
                rotation: currentRotations[nodeName],
                rotationDegrees: totalRotation,
                _updated: true
            };

            console.log(`Sending rotation to robot for ${nodeName}:`, totalRotation);
        }

        Object.keys(data.nodes).forEach((key) => {
            if (key !== nodeName) {
                newData.nodes[key] = {
                    ...data.nodes[key],
                    _updated: false
                };
            }
        });

        onUpdate(newData);
    };

    return (
        <group>
            <Gizmo scale={5}
                   disableTranslation
                   activeAxes={[true, false, true]}
                   userData={[node.mainColumn]}
                   onDragStart={() => handleDragStart(node.mainColumn, {position: data.nodes[node.mainColumn].position, rotation: currentRotations[node.mainColumn]})}
                   onDragEnd={() => handleDragEnd(node.mainColumn)}
                   onUpdate={(transform) => handleGizmoUpdate(node.mainColumn, transform)}>
                <Mesh node={nodes[node.mainColumn]} data={data.nodes[node.mainColumn]}/>

                <Gizmo activeAxes={[false, true, false]}
                       translationLimits={[undefined, [-1, .8], undefined]}
                       disableRotation
                       anchor={[-0.8, 1.5, 0]}
                       scale={1}
                       userData={[node.upperArm]}
                       onDragStart={() => handleDragStart(node.upperArm, {position: data.nodes[node.upperArm].position, rotation: [0,0,0]})}
                       onDragEnd={() => handleDragEnd(node.upperArm)}
                       onUpdate={(transform) => handleGizmoUpdate(node.upperArm, transform)}>
                    <Mesh node={nodes[node.upperArm]} data={data.nodes[node.upperArm]}/>
                    <Mesh node={nodes[node.wristExtension]} data={data.nodes[node.wristExtension]}/>
                    <Mesh node={nodes[node.hand]} data={data.nodes[node.hand]}/>

                    <Gizmo activeAxes={[false, false, true]}
                           translationLimits={[undefined, undefined, [0, 0.4]]}
                           anchor={[2, 0, 2]}
                           scale={0.75}
                           userData={[node.gripper]}
                           onDragStart={() => handleDragStart(node.gripper, {position: data.nodes[node.gripper].position, rotation: [0,0,0]})}
                           onDragEnd={() => handleDragEnd(node.gripper)}
                           onUpdate={(transform) => handleGizmoUpdate(node.gripper, transform)}>
                        <Mesh node={nodes[node.gripper]} data={data.nodes[node.gripper]}/>
                    </Gizmo>
                </Gizmo>
            </Gizmo>
        </group>
    );
};

useGLTF.preload('/robot.glb');