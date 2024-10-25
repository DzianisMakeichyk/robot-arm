import React from 'react'
import {Gizmo} from '@components/gizmo'
import {useGLTF} from '@react-three/drei'
import {Robot} from '@types'
import Mesh from "@components/mesh/Mesh"

interface RobotProps {
    data: Robot.RobotNodes;
    onUpdate: (newData: Partial<Robot.RobotNodes>) => void;
}

export const RobotArm = ({data, onUpdate}: RobotProps) => {
    const {nodes} = useGLTF('/robot.glb') as unknown as Robot.DreiGLTF;
    const node = Robot.NodeName;

    const handleGizmoUpdate = (nodeName: Robot.NodeName, newRotation: [number, number, number]) => {
        console.log(`RobotArm: Updating ${nodeName} rotation:`, newRotation);
        
        const newData: Partial<Robot.RobotNodes> = {
            nodes: {
                ...data.nodes,
                [nodeName]: {
                    ...data.nodes[nodeName],
                    rotation: newRotation
                }
            }
        };

        console.log('RobotArm: Sending update:', newData);
        onUpdate(newData);
    };

    return (
        <group>
            <Gizmo 
                scale={5}
                disableTranslation
                activeAxes={[true, false, true]}
                userData={[node.mainColumn]}
                matrix={undefined}
                onUpdate={(rotation) => {
                    console.log('Main column rotation:', rotation);
                    handleGizmoUpdate(node.mainColumn, rotation);
                }}>
                <Mesh node={nodes[node.mainColumn]} data={data.nodes[node.mainColumn]}/>

                <Gizmo 
                    activeAxes={[false, true, false]}
                    translationLimits={[undefined, [-1, .8], undefined]}
                    disableRotation={false}
                    anchor={[-0.8, 1.5, 0]}
                    scale={1}
                    userData={[node.upperArm]}
                    onUpdate={(rotation) => {
                        console.log('Upper arm rotation:', rotation);
                        handleGizmoUpdate(node.upperArm, rotation);
                    }}>
                    <Mesh node={nodes[node.upperArm]} data={data.nodes[node.upperArm]}/>
                    <Mesh node={nodes[node.wristExtension]} data={data.nodes[node.wristExtension]}/>
                    <Mesh node={nodes[node.hand]} data={data.nodes[node.hand]}/>

                    <Gizmo 
                        activeAxes={[false, false, true]}
                        translationLimits={[undefined, undefined, [0, 0.4]]}
                        anchor={[2, 0, 2]}
                        scale={0.75}
                        userData={[node.gripper]}
                        onUpdate={(rotation) => {
                            console.log('Gripper rotation:', rotation);
                            handleGizmoUpdate(node.gripper, rotation);
                        }}>
                        <Mesh node={nodes[node.gripper]} data={data.nodes[node.gripper]}/>
                    </Gizmo>
                </Gizmo>
            </Gizmo>
        </group>
    );
};

useGLTF.preload('/robot.glb');