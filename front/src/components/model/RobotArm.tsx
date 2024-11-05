// @ts-nocheck
import { Gizmo } from '@components/gizmo';
import { useGLTF } from '@react-three/drei';
import { Robot } from '@types';
import Mesh from "@components/mesh/Mesh";
import { useState } from 'react';
import { calculateRobotTransforms, createNodeUpdate } from 'src/utils/transforms';
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

    const handleGizmoUpdate = (nodeName: Robot.NodeName, transform: Robot.GizmoTransform) => {
        console.log(1)
        if (nodeName === node.upperArm) {
            setCurrentPositions(prev => ({...prev, [nodeName]: transform.position[1]}));
        } else if (nodeName === node.gripper) {
            setCurrentPositions(prev => ({...prev, [nodeName]: transform.position[2]}));
        } else {
            setCurrentPositions(prev => ({...prev, [nodeName]: transform.rotation}));
        }
    };

    const handleDragStart = (nodeName: Robot.NodeName, transform: Robot.GizmoTransform) => {
        if (nodeName === node.upperArm) {
            setStartPosition(prev => ({...prev, [nodeName]: transform.position[1]}));
        } else if (nodeName === node.gripper) {
            setStartPosition(prev => ({...prev, [nodeName]: transform.position[2]}));
        } else if (nodeName === node.mainColumn) {
            const euler = new Euler().fromArray(transform.rotation);
            const degrees = (euler.y * 180) / Math.PI;
            setStartPosition(prev => ({...prev, [nodeName]: degrees}));
        }
    };

    const handleDragEnd = (nodeName: Robot.NodeName) => {
        const current = currentPositions[nodeName] || 0;
        const initial = startPosition[nodeName] || 0;
        let rotationDegrees = 0;

        if (nodeName === node.upperArm) {
            rotationDegrees = calculateRobotTransforms.upperArm(current, initial);
        } else if (nodeName === node.gripper) {
            rotationDegrees = calculateRobotTransforms.gripper(current, initial);
        } else if (nodeName === node.mainColumn) {
            rotationDegrees = calculateRobotTransforms.mainColumn(currentPositions[nodeName], startRotation[nodeName]);
        }

        const ev3Data = createNodeUpdate(nodeName, data, rotationDegrees);
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