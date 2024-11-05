import { useState, useEffect, useCallback } from 'react';
import { Robot } from '@types';

const SOCKET_SERVER_URL = 'ws://localhost:4001';

export const useWebSocket = () => {
  const [robotData, setRobotData] = useState<Robot.RobotNodes>();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState<string>('');
  const [motorStatus, setMotorStatus] = useState<{[key: string]: string}>({
    base: 'unknown',
    elbow: 'unknown',
    height: 'unknown'
  });

  const initWebSocket = useCallback(() => {
    const websocket = new WebSocket(SOCKET_SERVER_URL);
    
    websocket.onopen = () => {
      setConnectionStatus('connected');
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        
        if (response.state?.nodes) {
          setRobotData(response.state);
        }
        
        if (response.status === 'error') {
          setError(response.message);
        }

        if (response.message) {
          setMotorStatus(prev => {
            const newStatus = {...prev};
            if (response.message.includes('Base motor')) {
              newStatus.base = response.message.includes('not available') ? 'disconnected' : 'connected';
            }
            if (response.message.includes('Elbow motor')) {
              newStatus.elbow = response.message.includes('not available') ? 'disconnected' : 'connected';
            }
            if (response.message.includes('Height motor')) {
              newStatus.height = response.message.includes('not available') ? 'disconnected' : 'connected';
            }
            return newStatus;
          });
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    };

    websocket.onclose = () => {
      setConnectionStatus('disconnected');
      setWs(null);
      setTimeout(initWebSocket, 1000);
    };
    
    websocket.onerror = () => {
      setConnectionStatus('error');
    };

    setWs(websocket);
  }, []);

  const updateRobotData = useCallback((newData: Partial<Robot.RobotNodes>) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      initWebSocket();
      return;
    }

    setRobotData(prevData => {
      if (prevData) {
        const updatedData = {...prevData, ...newData};
        ws.send(JSON.stringify({
          action: 'update',
          ...updatedData
        }));
        return updatedData;
      }
      return prevData;
    });
  }, [ws, initWebSocket]);

  const testMotor = useCallback(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'test_motor' }));
    }
  }, [ws]);

  useEffect(() => {
    initWebSocket();
    return () => ws?.close();
  }, []);

  return {
    robotData,
    connectionStatus,
    error,
    motorStatus,
    updateRobotData,
    testMotor
  };
};