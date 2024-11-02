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

    const handleGizmoUpdate = (nodeName: Robot.NodeName, newMatrix: [number, number, number]) => {
        console.log(`Updating ${nodeName}:`, newMatrix);
        
        const newData: Partial<Robot.RobotNodes> = {
            nodes: {
                ...data.nodes,
                [nodeName]: {
                    ...data.nodes[nodeName],
                    position: data.nodes[nodeName].position,
                    scale: data.nodes[nodeName].scale,
                    rotation: data.nodes[nodeName].rotation,
                    // Note: problem with rotation hand and gripper
                    // when use 
                    // rotation: newMatrix
                }
            }
        };

        // Preserve initial rotations for hand and gripper
        if (newData.nodes) {
            if (newData.nodes.hand) {
                newData.nodes.hand.rotation = data.nodes.hand.rotation;
            }
            if (newData.nodes.gripper) {
                newData.nodes.gripper.rotation = data.nodes.gripper.rotation;
            }
        }

        console.log('Sending update:', newData);
        onUpdate(newData);
    };

    return (
        <group>
            <Gizmo scale={5}
                   disableTranslation
                   activeAxes={[true, false, true]}
                   userData={[node.mainColumn]}
                   onUpdate={(newMatrix) => handleGizmoUpdate(node.mainColumn, newMatrix)}>
                <Mesh node={nodes[node.mainColumn]} data={data.nodes[node.mainColumn]}/>

                <Gizmo activeAxes={[false, true, false]}
                       translationLimits={[undefined, [-1, .8], undefined]}
                       disableRotation
                       anchor={[-0.8, 1.5, 0]}
                       scale={1}
                       userData={[node.upperArm]}
                       onUpdate={(newMatrix) => handleGizmoUpdate(node.upperArm, newMatrix)}>

                    <Mesh node={nodes[node.upperArm]} data={data.nodes[node.upperArm]}/>
                    <Mesh node={nodes[node.wristExtension]} data={data.nodes[node.wristExtension]}/>
                    <Mesh node={nodes[node.hand]} data={data.nodes[node.hand]}/>

                    <Gizmo activeAxes={[false, false, true]}
                           translationLimits={[undefined, undefined, [0, 0.4]]}
                           anchor={[2, 0, 2]}
                           scale={0.75}
                           userData={[node.gripper]}
                           onUpdate={(newMatrix) => handleGizmoUpdate(node.gripper, newMatrix)}>
                        <Mesh node={nodes[node.gripper]} data={data.nodes[node.gripper]}/>
                    </Gizmo>
                </Gizmo>
            </Gizmo>
        </group>
    );
};

useGLTF.preload('/robot.glb');