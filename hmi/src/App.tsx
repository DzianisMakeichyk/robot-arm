import React, {useState, useEffect, useCallback} from 'react';
import {Canvas} from '@react-three/fiber';
import {GizmoHelper, GizmoViewport, OrbitControls, Environment, Stats, PerspectiveCamera} from '@react-three/drei';
import {Shadows, Ground} from '@components/stage';
import socketIOClient, { Socket } from 'socket.io-client';
import {Robot} from '@types';
import {RobotArm} from "@components/model/RobotArm";

const SOCKET_SERVER_URL = 'http://localhost:4000';

export default function App() {
    const [robotData, setRobotData] = useState<Robot.RobotNodes>();    
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!socket) return;
    
        socket.on('test', (data: any) => {
            console.log('Received test from server:', data);
            socket.emit('test-response', 'Hello from client');
        });
    
        return () => {
            socket.off('test');
        };
    }, [socket]);

    // Initialize socket connection
    useEffect(() => {
        console.log('Initializing socket connection to:', SOCKET_SERVER_URL);
        const newSocket = socketIOClient(SOCKET_SERVER_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
            console.log('Socket connected with ID:', newSocket.id);
            setConnectionStatus('connected');
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnectionStatus('disconnected');
        });

        setSocket(newSocket);

        return () => {
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

    const testMotor = useCallback(() => {
        console.log('Test motor button clicked');
        console.log('Socket status:', {
            connected: socket?.connected,
            id: socket?.id,
            status: connectionStatus
        });

        if (!socket?.connected) {
            console.error('Socket not connected');
            return;
        }

        try {
            console.log('Emitting test-motor event');
            socket.emit('test-motor');
            console.log('Event emitted');
            
            // Force emit to ensure it's sent
            socket.volatile.emit('test-motor');
            
        } catch (error) {
            console.error('Error emitting event:', error);
        }
    }, [socket, connectionStatus]);

    useEffect(() => {
        if (!socket) return;
    
        console.log('Setting up socket event listeners...');
    
        socket.on('motor-test-complete', (msg: any) => {
            console.log('Motor test completed:', msg);
        });
    
        socket.on('motor-test-error', (error: any) => {
            console.error('Motor test error:', error);
        });
    
        // Debug incoming events
        socket.onAny((eventName: string, ...args: any[]) => {
            console.log(`Received socket event "${eventName}":`, args);
        });
    
        return () => {
            console.log('Cleaning up socket event listeners...');
            socket.off('motor-test-complete');
            socket.off('motor-test-error');
        };
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
            <div style={{
                position: 'fixed',
                top: '10px',
                left: '10px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <div style={{
                    padding: '5px',
                    background: connectionStatus === 'connected' ? '#4CAF50' : '#f44336',
                    color: 'white',
                    borderRadius: '4px'
                }}>
                    Socket Status: {connectionStatus}
                </div>
                <button
                    onClick={testMotor}
                    style={{
                        padding: '10px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Test Motor
                </button>
            </div>
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