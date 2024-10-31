import React, {useState, useEffect, useCallback} from 'react';
import {Canvas} from '@react-three/fiber';
import {GizmoHelper, GizmoViewport, OrbitControls, Environment, Stats, PerspectiveCamera} from '@react-three/drei';
import {Shadows, Ground} from '@components/stage';
// import socketIOClient, { Socket } from 'socket.io-client';
import {Robot} from '@types';
import {RobotArm} from "@components/model/RobotArm";

const SOCKET_SERVER_URL = 'ws://localhost:4001';

export default function App() {
    const [robotData, setRobotData] = useState<Robot.RobotNodes>();    
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [error, setError] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    useEffect(() => {
        const websocket = new WebSocket('ws://localhost:4001');
        
        websocket.onopen = () => {
            console.log('Connected to WebSocket');
            setWs(websocket);
        };

        websocket.onmessage = (event) => {
            console.log('Received:', event.data);
            try {
                const response = JSON.parse(event.data);
                setStatus(response.message);
            } catch (e) {
                console.error('Error parsing response:', e);
            }
        };

        return () => websocket.close();
    }, []);

    const testMotor = useCallback(() => {
        if (ws?.readyState === WebSocket.OPEN) {
            console.log('1000');
            ws.send(JSON.stringify({ action: 'test_motor' }));
            setStatus('Testing motor...');
        } else {
            setStatus('WebSocket not connected');
        }
    }, [ws]);

    const testHTTP = async () => {
        try {
            const response = await fetch('http://192.168.2.3:4000');
            console.log('HTTP test response:', response);
        } catch (error) {
            console.error('HTTP test failed:', error);
        }
    };


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

                <button onClick={testHTTP}>Test HTTP Connection</button>
            </div>
            {robotData && (
                <Canvas>
                    <PerspectiveCamera makeDefault fov={40} position={[10, 8, 25]}/>
                    {/* <RobotArm data={robotData} onUpdate={updateRobotData}/> */}
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