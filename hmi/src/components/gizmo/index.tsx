import React, {useEffect, useRef} from 'react'
import {useThree} from '@react-three/fiber'
import {Translate} from './Translate'
import {Rotate} from './Rotate'
import {context} from './context'
import {Vector3, Matrix4, Box3, Group, Euler} from 'three'
import {Robot} from '@types'

const localMatrix = new Matrix4()
const localMatrix0 = new Matrix4()
const localMatrix0Inv = new Matrix4()
const localDeltaMatrix = new Matrix4()
const worldMatrix0 = new Matrix4()
const worldMatrix = new Matrix4()
const parentMatrix = new Matrix4()
const parentMatrixInv = new Matrix4()

export const Gizmo = ({
    scale = 1,
    matrix,
    anchor,
    activeAxes = [true, true, true],
    disableTranslation = false,
    disableRotation = false,
    translationLimits,
    rotationLimits,
    userData,
    onUpdate,
    children,
}: Robot.GizmoProperties) => {
    const invalidate = useThree((state) => state.invalidate)
    const parentGroup = useRef<Group>(null!)
    const matrixGroup = useRef<Group>(null!)
    const gizmoGroup = useRef<Group>(null!)
    const childrenGroup = useRef<Group>(null!)

    useEffect(() => {
        if (anchor) {
            const targetGroup = childrenGroup.current
            const boundingBox = new Box3()

            if (targetGroup) {
                targetGroup.updateWorldMatrix(true, true)
                parentMatrixInv.copy(targetGroup.matrixWorld).invert()
                boundingBox.makeEmpty()

                targetGroup.traverse((object: any) => {
                    if (!object.geometry) return
                    if (!object.geometry.boundingBox) object.geometry.computeBoundingBox()

                    localMatrix.copy(object.matrixWorld).premultiply(parentMatrixInv)
                    const objectBoundingBox = new Box3()
                    objectBoundingBox.copy(object.geometry.boundingBox)
                    objectBoundingBox.applyMatrix4(localMatrix)
                    boundingBox.union(objectBoundingBox)
                })

                const vectorCenter = new Vector3()
                const vectorSize = new Vector3()
                const anchorOffsetVector = new Vector3()
                const positionVector = new Vector3()

                vectorCenter.copy(boundingBox.max).add(boundingBox.min).multiplyScalar(0.5)
                vectorSize.copy(boundingBox.max).sub(boundingBox.min).multiplyScalar(0.5)
                anchorOffsetVector.copy(vectorSize).multiply(new Vector3(...anchor)).add(vectorCenter)
                positionVector.set(0, 0, 0).add(anchorOffsetVector)
                gizmoGroup.current.position.copy(positionVector)

                invalidate()
            }
        }
    }, [anchor, invalidate])

    const configuration = {
        onDragStart: () => {
            console.log('Drag start');
            localMatrix0.copy(matrixGroup.current.matrix)
            worldMatrix0.copy(matrixGroup.current.matrixWorld)
            invalidate()
        },

        onDrag: (worldDeltaMatrix: Matrix4) => {
            console.log('Dragging');
            parentMatrix.copy(parentGroup.current.matrixWorld)
            parentMatrixInv.copy(parentMatrix).invert()
            worldMatrix.copy(worldMatrix0).premultiply(worldDeltaMatrix)
            localMatrix.copy(worldMatrix).premultiply(parentMatrixInv)
            localMatrix0Inv.copy(localMatrix0).invert()
            localDeltaMatrix.copy(localMatrix).multiply(localMatrix0Inv)
            matrixGroup.current.matrix.copy(localMatrix)

            // Extract rotation from matrix
            
            const rotation = new Euler().setFromRotationMatrix(localMatrix);
            const rotationArray: [number, number, number] = [rotation.x, rotation.y, rotation.z];

            console.log('Updating rotation:', rotationArray);
            if (onUpdate) {
                onUpdate(rotationArray);
            }

            invalidate()
        },

        onDragEnd: () => {
            console.log('Drag end');
            invalidate()
        },

        translationLimits,
        rotationLimits,
        scale,
        userData
    }

    return (
        <context.Provider value={configuration}>
            <group ref={parentGroup}>
                <group ref={matrixGroup} matrix={matrix} matrixAutoUpdate={false}>
                    <group ref={gizmoGroup}>
                        {!disableTranslation && (
                            <>
                                {activeAxes[0] && <Translate axis={0}/>}
                                {activeAxes[1] && <Translate axis={1}/>}
                                {activeAxes[2] && <Translate axis={2}/>}
                            </>
                        )}
                        {!disableRotation && (
                            <>
                                {activeAxes[0] && activeAxes[1] && <Rotate axis={2}/>}
                                {activeAxes[0] && activeAxes[2] && <Rotate axis={1}/>}
                                {activeAxes[2] && activeAxes[1] && <Rotate axis={0}/>}
                            </>
                        )}
                    </group>
                    <group ref={childrenGroup}>{children}</group>
                </group>
            </group>
        </context.Provider>
    )
}