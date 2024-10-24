import React, { useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { GizmoHelper, GizmoViewport, OrbitControls, Environment, Stats, PerspectiveCamera } from '@react-three/drei'
import { Shadows, Ground } from '@components/stage'
import { io } from 'socket.io-client'
import { Robot } from '@types'
import { RobotArm } from "@components/model/RobotArm"

export default function App() {
    const [robotData, setRobotData] = useState<Robot.RobotNodes>()
    const [socket, setSocket] = useState<any>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        // Create socket with WebSocket-only configuration
        const newSocket = io('ws://localhost:4000', {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
            console.log('WebSocket connected');
            setError('');
            newSocket.emit('state:get');
        });

        newSocket.on('connect_error', () => {
            setError('Unable to connect to server. Please ensure the server is running.');
        });

        newSocket.on('state', (data: Robot.RobotNodes) => {
            setRobotData(data);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const updateRobotData = useCallback((newData: Partial<Robot.RobotNodes>) => {
        if (!socket?.connected) return;
        
        setRobotData(prevData => {
            if (prevData) {
                const updatedData = {...prevData, ...newData};
                socket.emit("state:update", updatedData);
                return updatedData;
            }
            return prevData;
        });
    }, [socket]);

    if (error) {
        return (
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#ff4444',
                color: 'white',
                padding: '20px',
                borderRadius: '5px',
                textAlign: 'center'
            }}>
                {error}
                <button 
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: '10px',
                        padding: '5px 15px',
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            {robotData && (
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
            )}
        </>
    );
}