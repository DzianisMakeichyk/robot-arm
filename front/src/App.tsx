import { Canvas } from '@react-three/fiber';
import { GizmoHelper, GizmoViewport, OrbitControls, Environment, Stats, PerspectiveCamera } from '@react-three/drei';
import { Shadows, Ground } from '@components/stage';
import { RobotArm } from "@components/model/RobotArm";
import { useWebSocket } from './hooks/useWebSocket';
import { StatusDisplay } from '@components/status';
import { ErrorDisplay } from '@components/error';

export default function App() {
    const {
        robotData,
        connectionStatus,
        error,
        motorStatus,
        updateRobotData,
        testMotor
    } = useWebSocket();

    if (error) {
        return (
           <ErrorDisplay error={error} />
        );
    }

    return (
        <>
            <StatusDisplay 
                connectionStatus={connectionStatus}
                motorStatus={motorStatus}
                onTestMotor={testMotor}
            />
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