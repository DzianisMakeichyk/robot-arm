 
import React, {useContext, useCallback, useMemo, useRef, useState, FC} from 'react'
import {ThreeEvent, useThree} from '@react-three/fiber'
import {Line, Html} from '@react-three/drei'
import {context} from './context'
import {Vector3, Matrix4, Group, Quaternion} from 'three'
import {calculateOffset} from '@utils'

/**
 * Translate lets the user drag the gizmo and, with it, the child objects over the configured translation axis/axes
 */
export const Translate: FC<{ axis: 0 | 1 | 2 }> = ({axis}) => {

    // get the gizmo config & event implementations from context
    const {
        translationLimits,
        scale,
        onDragStart,
        onDrag,
        onDragEnd,
        userData
    } = useContext(context)

    // determine direction.
    const direction =
        axis === 0 ? new Vector3(1, 0, 0) :
            axis === 1 ? new Vector3(0, 1, 0) : new Vector3(0, 0, 1)

    // get a handle on the cam controls to enable/disable while operating the gizmo
    const camControls = useThree((state) => state.controls) as unknown as { enabled: boolean }

    // the label showing the translated value
    const translationLabel = useRef<HTMLDivElement>(null!)

    // Object3D group for this Gizmo
    const gizmoGroup = useRef<Group>(null!)

    // ref to keep info where the mouse/pointer click occurred
    const clickInfo = useRef<{ clickPoint: Vector3; dir: Vector3 } | null>(null)

    // the offset calculated on start and used while moving
    const offset0 = useRef<number>(0)

    // is the mouse hovering over the gizmo. we change the color when hovering over
    const [isHovered, setIsHovered] = useState(false)

    const translation = useRef<[number, number, number]>([0, 0, 0])

    /**
     * On pointer down (click) we prepare to start dragging
     */
    const onPointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {

            // update label with current translation value for this axis and show it
            translationLabel.current.innerText = `${translation.current[axis].toFixed(2)}`
            translationLabel.current.style.display = 'block'

            // stopPropagation will stop underlying handlers from firing
            event.stopPropagation()

            // get the xyz vector for the mouse click
            const clickPoint = event.point.clone()

            // @todo learn what is going on here
            const rotation = new Matrix4().extractRotation(gizmoGroup.current.matrixWorld)
            const origin = new Vector3().setFromMatrixPosition(gizmoGroup.current.matrixWorld)
            const dir = direction.clone().applyMatrix4(rotation).normalize()

            // set the click info
            clickInfo.current = {clickPoint, dir}
            offset0.current = translation.current[axis]

            // invoke drag start for translation operation
            onDragStart({action: 'Translate', axis, origin, directions: [dir]})

            // disable the cam controls to avoid it fighting with the gizmo movements
            camControls && (camControls.enabled = false)

            // @ts-ignore - setPointerCapture is not in the type definition
            event.target.setPointerCapture(event.pointerId)

        }, [direction, camControls, onDragStart, translation, axis]
    )

    /**
     * Mouse/pointer moving
     */
    const onPointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {

            // stopPropagation will stop underlying handlers from firing
            event.stopPropagation()

            if (!isHovered) setIsHovered(true)

            if (clickInfo.current) {

                const {clickPoint, dir} = clickInfo.current

                /**
                 * Check if we are still within translation limits
                 */
                const [min, max] = translationLimits?.[axis] || [undefined, undefined]
                let offset = calculateOffset(clickPoint, dir, event.ray.origin, event.ray.direction)
                if (min !== undefined) offset = Math.max(offset, min - offset0.current)
                if (max !== undefined) offset = Math.min(offset, max - offset0.current)

                // set the current translation
                translation.current[axis] = offset0.current + offset

                // update label with translation value
                translationLabel.current.innerText = `${translation.current[axis].toFixed(2)}`

                // create and calculate the offset matrix for the on drag method
                const offsetMatrix = new Matrix4().makeTranslation(dir.x * offset, dir.y * offset, dir.z * offset)

                // invoke the onDrag method with the calculated offset matrix
                onDrag(offsetMatrix)
            }

        }, [onDrag, isHovered, translation, translationLimits, axis]
    )

    /**
     * Pointer up ends the gizmo interaction
     */
    const onPointerUp = useCallback((event: ThreeEvent<PointerEvent>) => {

            // hide label
            translationLabel.current.style.display = 'none'

            // avoid handlers firing
            event.stopPropagation()

            // reset click info
            clickInfo.current = null

            // call the onDragEnd
            onDragEnd()

            // give cam controls back
            camControls && (camControls.enabled = true)

            // @ts-ignore - releasePointerCapture & PointerEvent#pointerId is not in the type definition
            event.target.releasePointerCapture(event.pointerId)

        }, [camControls, onDragEnd]
    )

    /**
     * In the pointer out we mark hovered as false
     */
    const onPointerOut = useCallback((event: ThreeEvent<PointerEvent>) => {
        // avoid handlers firing
        event.stopPropagation()
        setIsHovered(false)
    }, [])

    // calculate properties for the translation arrow meshes
    const {cylinderLength, coneWidth, coneLength, matrix} = useMemo(() => {
        const coneWidth = scale / 20
        const coneLength = scale / 5
        const cylinderLength = scale - coneLength
        const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize())
        const matrixL = new Matrix4().makeRotationFromQuaternion(quaternion)
        return {cylinderLength, coneWidth, coneLength, matrix: matrixL}
    }, [direction, scale])

    // colors of the axes and a hover color
    const axisColors = ['#ff2060', '#20df80', '#2080ff']
    const color = isHovered ? '#ffff40' : axisColors[axis]

    return (
        <group ref={gizmoGroup}>

            {/** group on which we set the gizmo event implementations */}
            <group
                matrix={matrix}
                matrixAutoUpdate={false}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerOut={onPointerOut}>

                {/** the label showing the translation value */}
                <Html position={[0, -coneLength, 0]}>
                    <div
                        style={{
                            display: 'none',
                            fontFamily: 'monospace',
                            background: '#F84823',
                            color: 'white',
                            padding: '6px 8px',
                            borderRadius: 7,
                            whiteSpace: 'nowrap'
                        }}
                        ref={translationLabel}
                    />
                </Html>

                {/* The invisible mesh being raycast
                    @todo learn how this works
                 */}
                <mesh visible={false} position={[0, (cylinderLength + coneLength) / 2.0, 0]} userData={userData}>
                    <cylinderGeometry args={[coneWidth * 1.4, coneWidth * 1.4, cylinderLength + coneLength, 8, 1]}/>
                </mesh>

                {/* The visible mesh */}
                <Line transparent
                      raycast={() => null}
                      points={[0, 0, 0, 0, cylinderLength, 0]}
                      lineWidth={2}
                      color={color}
                      polygonOffset
                      renderOrder={1}
                      polygonOffsetFactor={-10}/>
                <mesh raycast={() => null} position={[0, cylinderLength + coneLength / 2.0, 0]} renderOrder={500}>
                    <coneGeometry args={[coneWidth, coneLength, 24, 1]}/>
                    <meshBasicMaterial transparent={true} color={color}/>
                </mesh>

            </group>
        </group>
    )
}
