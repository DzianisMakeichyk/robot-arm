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
    const [visualData, setVisualData] = useState<Robot.RobotNodes>(data);
    const [currentRotations, setCurrentRotations] = useState<{[key: string]: [number, number, number]}>({
        [node.mainColumn]: [0,0,0],
        [node.upperArm]: [0,0,0],
        [node.gripper]: [0,0,0]
    });
    const SCALE_FACTORS = {
        [node.mainColumn]: 4,
        [node.upperArm]: 180,  // Zwiększony współczynnik dla upperArm
        [node.gripper]: 180    // Taki sam współczynnik dla grippera
    };

    const handleGizmoUpdate = (nodeName: Robot.NodeName, transform: { position: [number, number, number], rotation: [number, number, number] }) => {
        if (nodeName === node.upperArm) {
            const height = transform.position[1];
            setCurrentPositions(prev => ({
                ...prev,
                [nodeName]: height
            }));
        } else if (nodeName === node.gripper) {
            const position = transform.position[2];
            setCurrentPositions(prev => ({
                ...prev,
                [nodeName]: position
            }));
        } else {
            setCurrentPositions(prev => ({
                ...prev,
                [nodeName]: transform.rotation
            }));
        }
    };

    const handleDragStart = (nodeName: Robot.NodeName, transform: { position: [number, number, number], rotation: [number, number, number] }) => {
        if (nodeName === node.upperArm) {
            setStartPosition(prev => ({
                ...prev,
                [nodeName]: transform.position[1]
            }));
        } else if (nodeName === node.gripper) {
            setStartPosition(prev => ({
                ...prev,
                [nodeName]: transform.position[2]
            }));
        } else if (nodeName === node.mainColumn){
            const euler = new Euler().fromArray(transform.rotation);
            const degrees = (euler.y * 180) / Math.PI;
            setStartPosition(prev => ({
                ...prev,
                [nodeName]: degrees
            }));
        }

        console.log(9999999999, nodeName, node.mainColumn, nodeName === node.mainColumn);
    };

    const handleDragEnd = (nodeName: Robot.NodeName) => {
        // Dane dla EV3
        const ev3Data: Partial<Robot.RobotNodes> = {
            nodes: {
                ...data.nodes // Kopiujemy wszystkie oryginalne dane
            }
        };

        if (nodeName === node.upperArm) {
            const currentHeight = currentPositions[nodeName] || 0;
            const initialHeight = startPosition[nodeName] || 0;
            const heightChange = currentHeight - initialHeight;
            const rotationDegrees = heightChange * 90 * -1 * 2;

            ev3Data.nodes[nodeName] = {
                ...data.nodes[nodeName], // Zachowujemy oryginalne dane
                position: data.nodes[nodeName].position,
                scale: data.nodes[nodeName].scale,
                rotation: data.nodes[nodeName].rotation,
                rotationDegrees,
                _updated: true
            };
        } 
        else if (nodeName === node.gripper) {
            const currentPosition = currentPositions[nodeName] || 0;
            const initialPosition = startPosition[nodeName] || 0;
            const positionChange = currentPosition - initialPosition;
            const rotationDegrees = positionChange * 90 * -1 * 2;

            console.log('===>>> rotationDegrees <<<===', rotationDegrees);

            ev3Data.nodes[nodeName] = {
                ...data.nodes[nodeName], // Zachowujemy oryginalne dane
                position: data.nodes[nodeName].position,
                scale: data.nodes[nodeName].scale,
                rotation: data.nodes[nodeName].rotation,
                rotationDegrees,
                _updated: true
            };
        }
        else if (nodeName === node.mainColumn) {
            const euler = new Euler().fromArray(currentPositions[nodeName]);
            const endDegrees = (euler.y * 180) / Math.PI;
            const totalRotation = endDegrees - (startRotation[nodeName] || 0);
            const rotationDegrees = totalRotation * 4 * -1;

            console.log('===>>> endDegrees <<<===', endDegrees);
            console.log('===>>> Rotation <<<===', totalRotation);
            console.log('===>>> startRotation <<<===', startRotation);

            ev3Data.nodes[nodeName] = {
                ...data.nodes[nodeName], // Zachowujemy oryginalne dane
                position: data.nodes[nodeName].position,
                scale: data.nodes[nodeName].scale,
                rotation: currentPositions[nodeName],
                rotationDegrees,
                _updated: true
            };
        }

        // Reset updated flag dla innych węzłów
        Object.keys(ev3Data.nodes).forEach((key) => {
            if (key !== nodeName) {
                ev3Data.nodes[key] = {
                    ...data.nodes[key], // Zachowujemy oryginalne dane
                    _updated: false
                };
            }
        });

        onUpdate(ev3Data);
    };

    return (
        <group>
            <Gizmo scale={5}
                   disableTranslation
                   activeAxes={[true, false, true]}
                   userData={[node.mainColumn]}
                   onDragStart={() => handleDragStart(node.mainColumn, {position: visualData.nodes[node.mainColumn].position, rotation: visualData.nodes[node.mainColumn].rotation})}
                   onDragEnd={() => handleDragEnd(node.mainColumn)}
                   onUpdate={(transform) => handleGizmoUpdate(node.mainColumn, transform)}>
                <Mesh node={nodes[node.mainColumn]} data={visualData.nodes[node.mainColumn]}/>

                <Gizmo activeAxes={[false, true, false]}
                       translationLimits={[undefined, [-1, .8], undefined]}
                       disableRotation
                       anchor={[-0.8, 1.5, 0]}
                       scale={1}
                       userData={[node.upperArm]}
                       onDragStart={() => handleDragStart(node.upperArm, {position: visualData.nodes[node.upperArm].position, rotation: visualData.nodes[node.upperArm].rotation})}
                       onDragEnd={() => handleDragEnd(node.upperArm)}
                       onUpdate={(transform) => handleGizmoUpdate(node.upperArm, transform)}>
                    <Mesh node={nodes[node.upperArm]} data={visualData.nodes[node.upperArm]}/>
                    <Mesh node={nodes[node.wristExtension]} data={visualData.nodes[node.wristExtension]}/>
                    <Mesh node={nodes[node.hand]} data={visualData.nodes[node.hand]}/>

                    <Gizmo activeAxes={[false, false, true]}
                           translationLimits={[undefined, undefined, [0, 0.4]]}
                           anchor={[2, 0, 2]}
                           scale={0.75}
                           userData={[node.gripper]}
                           onDragStart={() => handleDragStart(node.gripper, {position: visualData.nodes[node.gripper].position, rotation: visualData.nodes[node.gripper].rotation})}
                           onDragEnd={() => handleDragEnd(node.gripper)}
                           onUpdate={(transform) => handleGizmoUpdate(node.gripper, transform)}>
                        <Mesh node={nodes[node.gripper]} data={visualData.nodes[node.gripper]}/>
                    </Gizmo>
                </Gizmo>
            </Gizmo>
        </group>
    );
};