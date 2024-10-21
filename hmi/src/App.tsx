import React, {useState, useEffect, useCallback} from 'react'
import {Canvas} from '@react-three/fiber'
import {GizmoHelper, GizmoViewport, OrbitControls, Environment, Stats, PerspectiveCamera} from '@react-three/drei'
import {Shadows, Ground} from '@components/stage'
import socketIOClient from 'socket.io-client'
import {Robot} from '@types'
import {RobotArm} from "@components/model/RobotArm"

export default function App() {
    const [robotData, setRobotData] = useState<Robot.RobotNodes>()
    const socket = socketIOClient('/')

    useEffect(() => {
        if (!robotData) socket.emit("state:get")

        socket.on("state", (data: Robot.RobotNodes) => {
            setRobotData(data)
        })

        return () => {
            socket.off("state")
        }
    }, [socket])

    const updateRobotData = useCallback((newData: Partial<Robot.RobotNodes>) => {
        setRobotData(prevData => {
            if (prevData) {
                const updatedData = {...prevData, ...newData}
                socket.emit("state:update", updatedData)
                return updatedData
            }
            return prevData
        })
    }, [socket])

    return (
        <>
            {robotData &&
                <Canvas>
                    <PerspectiveCamera makeDefault fov={40} position={[10, 8, 25]}/>
                    <RobotArm data={robotData} onUpdate={updateRobotData}/>
                    <Shadows/>
                    <Ground/>
                    <Environment preset="city"/>
                    <OrbitControls makeDefault/>
                    <GizmoHelper alignment="bottom-right" margin={[100, 100]}>
                        <GizmoViewport labelColor="white" axisHeadScale={1}/>
                    </GizmoHelper>
                    <Stats/>
                </Canvas>
            }
        </>
    )
}