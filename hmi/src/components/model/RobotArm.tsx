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
    const [currentRotation, setCurrentRotation] = useState<[number, number, number]>([0,0,0]);
    
    const handleGizmoUpdate = (nodeName: Robot.NodeName, newRotation: [number, number, number]) => {
        setCurrentRotation(newRotation);
        const euler = new Euler().fromArray(newRotation);
        const currentDegrees = (euler.y * 180) / Math.PI;
        console.log('Current rotation during drag:', currentDegrees);
    };

    const handleDragStart = (nodeName: Robot.NodeName, rotation: [number, number, number]) => {
        const euler = new Euler().fromArray(rotation);
        const degrees = (euler.y * 180) / Math.PI;
        setStartRotation(prev => ({
            ...prev,
            [nodeName]: degrees
        }));
        console.log('Start rotation:', degrees);
    };

    const handleDragEnd = (nodeName: Robot.NodeName) => {
        const euler = new Euler().fromArray(currentRotation);
        const endDegrees = (euler.y * 180) / Math.PI;
        const totalRotation = endDegrees - (startRotation[nodeName] || 0);

        console.log('End degrees:', endDegrees);
        console.log('Start rotation was:', startRotation[nodeName]);
        console.log('Total rotation:', totalRotation);

        const newData: Partial<Robot.RobotNodes> = {
            nodes: {
                ...data.nodes,
                [nodeName]: {
                    ...data.nodes[nodeName],
                    position: data.nodes[nodeName].position,
                    scale: data.nodes[nodeName].scale,
                    rotation: currentRotation,
                    rotationDegrees: totalRotation * 4,
                    _updated: true
                }
            }
        };

        Object.keys(newData.nodes || {}).forEach((key) => {
            // @ts-ignore
            if (key !== nodeName && newData.nodes && newData.nodes[key]) {
                // @ts-ignore
                newData.nodes[key]._updated = false;
            }
        });

        console.log('Sending final rotation to robot:', totalRotation);
        onUpdate(newData);
    };


    return (
        <group>
            <Gizmo scale={5}
                   disableTranslation
                   activeAxes={[true, false, true]}
                   userData={[node.mainColumn]}
                   onUpdate={(newMatrix) => handleGizmoUpdate(node.mainColumn, newMatrix)}
                   onDragStart={() => handleDragStart(node.mainColumn, currentRotation)}
                   onDragEnd={() => handleDragEnd(node.mainColumn)}
                >
                <Mesh node={nodes[node.mainColumn]} data={data.nodes[node.mainColumn]}/>

                <Gizmo activeAxes={[false, true, false]}
                       translationLimits={[undefined, [-1, .8], undefined]}
                       disableRotation
                       anchor={[-0.8, 1.5, 0]}
                       scale={1}
                       userData={[node.upperArm]}
                       onUpdate={(newMatrix) => handleGizmoUpdate(node.upperArm, newMatrix)}
                       onDragStart={() => handleDragStart(node.mainColumn, currentRotation)}
                       onDragEnd={() => handleDragEnd(node.mainColumn)}
                       >

                    <Mesh node={nodes[node.upperArm]} data={data.nodes[node.upperArm]}/>
                    <Mesh node={nodes[node.wristExtension]} data={data.nodes[node.wristExtension]}/>
                    <Mesh node={nodes[node.hand]} data={data.nodes[node.hand]}/>

                    <Gizmo activeAxes={[false, false, true]}
                           translationLimits={[undefined, undefined, [0, 0.4]]}
                           anchor={[2, 0, 2]}
                           scale={0.75}
                           userData={[node.gripper]}
                           onUpdate={(newMatrix) => handleGizmoUpdate(node.gripper, newMatrix)}
                           onDragStart={() => handleDragStart(node.mainColumn, currentRotation)}
                           onDragEnd={() => handleDragEnd(node.mainColumn)}
                           >
                        <Mesh node={nodes[node.gripper]} data={data.nodes[node.gripper]}/>
                    </Gizmo>
                </Gizmo>
            </Gizmo>
        </group>
    );
};

useGLTF.preload('/robot.glb');