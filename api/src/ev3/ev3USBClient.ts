import { SerialPort } from 'serialport';
import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../config/logger';
import { 
    MotorPorts, 
    MotorConfig,
    motorPortToHex 
} from './portConfig';
import { EV3Protocol } from './ev3Protocol';

const execAsync = promisify(exec);
// @ts-ignore
// import nxt from './nxtts';
// const nxt0 = new nxt.NXT('/dev/tty.NXT-DevB', true);


class EV3USBClient {
    private serialPort: SerialPort | null = null;
    private isConnected: boolean = false;
    private isSimulated: boolean = false;
    private readonly BAUD_RATE = 115200;
    private selectedPort: string | null = null;

    constructor() {
        logger.info('==== Starting EV3 USB Client ====');
        this.initialize().catch(error => {
            logger.error('Failed to initialize:', error);
            this.enableSimulationMode();
        });
    }

    private async findEV3Port(): Promise<string | null> {
        try {
            const ports = await SerialPort.list();
            logger.info('==== Available Serial Ports ====');
            ports.forEach(port => {
                logger.info(`Port: ${port.path}`);
                logger.info(`  → Manufacturer: ${port.manufacturer || 'Unknown'}`);
                logger.info(`  → Serial Number: ${port.serialNumber || 'Unknown'}`);
                logger.info(`  → Vendor ID: ${port.vendorId || 'Unknown'}`);
                logger.info(`  → Product ID: ${port.productId || 'Unknown'}`);
                logger.info('------------------------');
            });

            // Try each port
            for (const port of ports) {
                logger.info(`Testing port: ${port.path}`);
                
                try {
                    const testPort = new SerialPort({
                        path: port.path,
                        baudRate: this.BAUD_RATE,
                        autoOpen: false,
                        lock: false
                    });

                    const canOpen = await new Promise((resolve) => {
                        testPort.open((err) => {
                            if (err) {
                                logger.info(`Failed to open ${port.path}: ${err.message}`);
                                resolve(false);
                            } else {
                                testPort.close();
                                resolve(true);
                            }
                        });
                    });

                    if (canOpen) {
                        logger.info(`✓ Successfully tested port: ${port.path}`);
                        return port.path;
                    }

                } catch (err) {
                    logger.info(`✗ Port ${port.path} test failed: ${err}`);
                }
            }

            logger.error('✗ No usable ports found for EV3');
            return null;

        } catch (error) {
            logger.error('✗ Error scanning for ports:', error);
            return null;
        }
    }

    private async initialize() {
        try {
            logger.info('==== Initializing EV3 Connection ====');
            
            this.selectedPort = await this.findEV3Port();
            if (!this.selectedPort) {
                throw new Error('No usable EV3 port found');
            }

            logger.info(`Attempting connection to: ${this.selectedPort}`);

            this.serialPort = new SerialPort({
                path: this.selectedPort,
                baudRate: this.BAUD_RATE,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                rtscts: true,
                autoOpen: false,
                lock: false
            });

            // Set up event handlers
            this.serialPort.on('open', () => {
                this.isConnected = true;
                logger.info(`✓ Connection established on ${this.selectedPort}`);
                this.testConnection();
            });

            this.serialPort.on('error', (err) => {
                logger.error(`✗ Connection error on ${this.selectedPort}:`, err);
                this.enableSimulationMode();
            });

            this.serialPort.on('close', () => {
                logger.info(`Connection closed on ${this.selectedPort}`);
                this.isConnected = false;
            });

            this.serialPort.on('data', (data) => {
                logger.info('Received data from EV3:', data);
            });

            await this.connect();

        } catch (error) {
            logger.error('✗ Initialization failed:', error);
            this.enableSimulationMode();
            throw error;
        }
    }

    private async testConnection() {
        try {
            logger.info('Testing EV3 connection...');
            // Send a simple reset command to test communication
            const testCommand = EV3Protocol.createResetCommand(0x00);
            await this.sendCommand(testCommand);
            logger.info('✓ Connection test successful');
        } catch (error) {
            logger.error('✗ Connection test failed:', error);
        }
    }

    private async connect() {
        if (!this.serialPort) {
            throw new Error('Serial port not initialized');
        }

        return new Promise((resolve, reject) => {
            this.serialPort?.open((err) => {
                if (err) {
                    logger.error('Failed to open serial port:', err);
                    this.enableSimulationMode();
                    reject(err);
                } else {
                    logger.info('Serial port opened successfully');


                    // nxt0.Connect(function(error: any) {
                    //     if (error) {
                    //     logger.info('Could not connect to the device!:', error);
                    //     } else {
                    //       nxt0.PlayTone(1000, 2000, function(error: any) {
                    //         if (error) {
                    //         logger.info('Could not play the tone!:', error);
                    //         }
                      
                    //         nxt0.Disconnect();
                    //       });
                    //     }
                    //   });

                    resolve(true);
                }
            });
        });
    }

    private enableSimulationMode() {
        if (!this.isSimulated) {
            logger.info('Enabling simulation mode');
            this.isSimulated = true;
        }
    }

    private async sendCommand(command: Buffer) {
        if (this.isSimulated) {
            logger.info('Simulation mode - Command:', command);
            return;
        }

        if (!this.isConnected || !this.serialPort) {
            throw new Error('Not connected to EV3');
        }

        return new Promise((resolve, reject) => {
            this.serialPort?.write(command, (err) => {
                if (err) {
                    logger.error('Error sending command:', err);
                    reject(err);
                } else {
                    this.serialPort?.drain(() => {
                        logger.info('Command sent and buffer drained:', command);
                        resolve(true);
                    });
                }
            });
        });
    }

    async moveBase(angle: number) {
        const config = MotorConfig[MotorPorts.BASE];
        const clampedAngle = Math.max(
            config.minDegrees,
            Math.min(config.maxDegrees, angle)
        );

        const command = EV3Protocol.createMotorCommand(
            config.portNumber,
            config.defaultSpeed,
            clampedAngle
        );

        logger.info(`Moving base (Port ${MotorPorts.BASE}) to ${clampedAngle}°`);
        await this.sendCommand(command);
    }

    async moveElbow(angle: number) {
        const config = MotorConfig[MotorPorts.ELBOW];
        const clampedAngle = Math.max(
            config.minDegrees,
            Math.min(config.maxDegrees, angle)
        );

        const command = EV3Protocol.createMotorCommand(
            config.portNumber,
            config.defaultSpeed,
            clampedAngle
        );

        logger.info(`Moving elbow (Port ${MotorPorts.ELBOW}) to ${clampedAngle}°`);
        await this.sendCommand(command);
    }

    async moveHeight(angle: number) {
        const config = MotorConfig[MotorPorts.HEIGHT];
        const clampedAngle = Math.max(
            config.minDegrees,
            Math.min(config.maxDegrees, angle)
        );

        const command = EV3Protocol.createMotorCommand(
            config.portNumber,
            config.defaultSpeed,
            clampedAngle
        );

        logger.info(`Moving height (Port ${MotorPorts.HEIGHT}) to ${clampedAngle}°`);
        await this.sendCommand(command);
    }

    async moveGripper(position: number) {
        const config = MotorConfig[MotorPorts.GRIPPER];
        const angle = (position / 100) * (config.maxDegrees - config.minDegrees);
        const clampedAngle = Math.max(
            config.minDegrees,
            Math.min(config.maxDegrees, angle)
        );

        const command = EV3Protocol.createMotorCommand(
            config.portNumber,
            config.defaultSpeed,
            clampedAngle
        );

        logger.info(`Moving gripper (Port ${MotorPorts.GRIPPER}) to ${clampedAngle}°`);
        await this.sendCommand(command);
    }

    async calibrateBasePosition() {
        try {
            logger.info('Starting base position calibration...');
            const command = EV3Protocol.createResetCommand(motorPortToHex[MotorPorts.BASE]);
            await this.sendCommand(command);
        } catch (error) {
            logger.error('Calibration error:', error);
        }
    }

    async disconnect() {
        try {
            if (this.serialPort) {
                const stopAllCommand = EV3Protocol.createStopCommand(0x0F); // All ports
                await this.sendCommand(stopAllCommand);
                await this.serialPort.close();
                this.isConnected = false;
            }
        } catch (error) {
            logger.error('Disconnect error:', error);
        }
    }

    async isDeviceConnected(): Promise<{ connected: boolean; port: string | null; simulated: boolean }> {
        return {
            connected: this.isConnected,
            port: this.selectedPort,
            simulated: this.isSimulated
        };
    }
}

export default EV3USBClient;