import React, {useState, useEffect, useCallback} from 'react';
import {Canvas} from '@react-three/fiber';
import {GizmoHelper, GizmoViewport, OrbitControls, Environment, Stats, PerspectiveCamera} from '@react-three/drei';
import {Shadows, Ground} from '@components/stage';
import {Robot} from '@types';
import {RobotArm} from "@components/model/RobotArm";

const SOCKET_SERVER_URL = 'ws://localhost:4001';

export default function App() {
    const [robotData, setRobotData] = useState<Robot.RobotNodes>();    
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        console.log('Connecting to:', SOCKET_SERVER_URL);
        const websocket = new WebSocket(SOCKET_SERVER_URL);
        
        websocket.onopen = () => {
            console.log('WebSocket Connected');
            setConnectionStatus('connected');
            setWs(websocket);
            
            // Request initial state
            websocket.send(JSON.stringify({ action: 'test_motor' }));
        };

        websocket.onmessage = (event) => {
            console.log('Received raw message:', event.data);
            try {
                const response = JSON.parse(event.data);
                console.log('Parsed response:', response);
                
                if (response.state && response.state.nodes) {
                    console.log('Updating robot data with:', response.state);
                    setRobotData(response.state);
                }
                
                if (response.status === 'error') {
                    console.error('Server error:', response.message);
                    setError(response.message);
                }
            } catch (e) {
                console.error('Parse error:', e);
            }
        };

        websocket.onclose = (event) => {
            console.log('WebSocket closed:', event);
            setConnectionStatus('disconnected');
            setWs(null);
        };
        
        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnectionStatus('error');
        };
        
        return () => websocket.close();
    }, []);

    const updateRobotData = useCallback((newData: Partial<Robot.RobotNodes>) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }

        setRobotData(prevData => {
            if (prevData) {
                const updatedData = {...prevData, ...newData};
                console.log('Sending update:', updatedData);
                ws.send(JSON.stringify({
                    action: 'update',
                    ...updatedData
                }));
                return updatedData;
            }
            return prevData;
        });
    }, [ws])

    const testMotor = useCallback(() => {
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ action: 'test_motor' }));
        } else {
            console.error('WebSocket not connected');
        }
    }, [ws]);

    useEffect(() => {
        console.log('Current robot data:', robotData);
    }, [robotData]);

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