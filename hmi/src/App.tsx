import React, {useState, useEffect, useCallback} from 'react';
import {Canvas} from '@react-three/fiber';
import {GizmoHelper, GizmoViewport, OrbitControls, Environment, Stats, PerspectiveCamera} from '@react-three/drei';
import {Shadows, Ground} from '@components/stage';
import socketIOClient from 'socket.io-client';
import {Robot} from '@types';
import {RobotArm} from "@components/model/RobotArm";

const SOCKET_SERVER_URL = 'http://localhost:4000';

export default function App() {
    const [robotData, setRobotData] = useState<Robot.RobotNodes>();
    const [socket, setSocket] = useState<any>(null);
    const [error, setError] = useState<string>('');

    // Initialize socket connection
    useEffect(() => {
        console.log('Initializing socket connection...');
        const newSocket = socketIOClient(SOCKET_SERVER_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
            console.log('Connected to server, socket id:', newSocket.id);
            setError('');
        });

        newSocket.on('connect_error', (error: any) => {
            console.error('Socket connection error:', error);
            setError(`Connection error: ${error.message}`);
        });

        newSocket.on('error', (error: any) => {
            console.error('Socket error:', error);
            setError(`Socket error: ${error.message}`);
        });

        setSocket(newSocket);

        return () => {
            console.log('Cleaning up socket connection...');
            newSocket.close();
        };
    }, []);

    // Handle initial state and state updates
    useEffect(() => {
        if (!socket) return;

        // Request initial state
        if (!robotData) {
            console.log('Requesting initial state...');
            socket.emit("state:get");
        }

        // Listen for state updates
        socket.on("state", (data: Robot.RobotNodes) => {
            console.log('Received state update:', data);
            setRobotData(data);
        });

        return () => {
            socket.off("state");
        };
    }, [socket, robotData]);

    const updateRobotData = useCallback((newData: Partial<Robot.RobotNodes>) => {
        if (!socket?.connected) {
            console.error('Cannot update: Socket not connected');
            return;
        }

        console.log('Updating robot data:', newData);
        setRobotData(prevData => {
            if (prevData) {
                const updatedData = {...prevData, ...newData};
                console.log('Emitting state update:', updatedData);
                socket.emit("state:update", updatedData);
                return updatedData;
            }
            return prevData;
        });
    }, [socket]);

    // Display error if any
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
                <div>{error}</div>
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