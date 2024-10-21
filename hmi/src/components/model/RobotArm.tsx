import React from 'react'
import {Gizmo} from '@components/gizmo'
import {useGLTF} from '@react-three/drei'
import {Robot} from '@types'
import Mesh from "@components/mesh/Mesh"

interface RobotProps {
    data: Robot.RobotNodes
    onUpdate: (newData: Partial<Robot.RobotNodes>) => void
}

export const RobotArm = ({data, onUpdate}: RobotProps) => {
    const {nodes} = useGLTF('/robot.glb') as unknown as Robot.DreiGLTF
    const node = Robot.NodeName

    const handleGizmoUpdate = (nodeName: Robot.NodeName, newPosition: [number, number, number]) => {
        onUpdate({
            nodes: {
                ...data.nodes,
                [nodeName]: {
                    ...data.nodes[nodeName],
                    position: newPosition
                }
            }
        })
    }

    return (
        <group>
            <Gizmo scale={5}
                   disableTranslation
                   activeAxes={[true, false, true]}
                   userData={[node.mainColumn]}
                   onUpdate={(newPosition) => handleGizmoUpdate(node.mainColumn, newPosition)}>
                <Mesh node={nodes[node.mainColumn]} data={data.nodes[node.mainColumn]}/>

                <Gizmo activeAxes={[false, true, false]}
                       translationLimits={[undefined, [-1, .8], undefined]}
                       disableRotation
                       anchor={[-0.8, 1.5, 0]}
                       scale={1}
                       userData={[node.upperArm]}
                       onUpdate={(newPosition) => handleGizmoUpdate(node.upperArm, newPosition)}>
                    <Mesh node={nodes[node.upperArm]} data={data.nodes[node.upperArm]}/>

                    <Mesh node={nodes[node.wristExtension]} data={data.nodes[node.wristExtension]}/>
                    <Mesh node={nodes[node.hand]} data={data.nodes[node.hand]}/>

                    <Gizmo activeAxes={[false, false, true]}
                           translationLimits={[undefined, undefined, [0, 0.4]]}
                           anchor={[2, 0, 2]}
                           scale={0.75}
                           userData={[node.gripper]}
                           onUpdate={(newPosition) => handleGizmoUpdate(node.gripper, newPosition)}>
                        <Mesh node={nodes[node.gripper]} data={data.nodes[node.gripper]}/>
                    </Gizmo>
                </Gizmo>
            </Gizmo>
        </group>
    )
}

useGLTF.preload('/robot.glb')