import bleno from '@abandonware/bleno';
import logger from '../config/logger';
import RobotService from './blenoService';

class MacBluetoothClient {
    private isConnected: boolean = false;
    private isSimulated: boolean = false;
    private robotService: RobotService;
    private readonly NAME = 'RoboticArm';

    constructor() {
        this.robotService = new RobotService();
        this.initialize();
    }

    private initialize() {
        try {
            logger.info('Initializing Bluetooth...');

            bleno.on('stateChange', (state) => {
                logger.info('Bluetooth state changed:', state);
                
                if (state === 'poweredOn') {
                    this.startAdvertising();
                } else {
                    bleno.stopAdvertising();
                }
            });

            bleno.on('advertisingStart', (error) => {
                if (error) {
                    logger.error('Advertising start error:', error);
                    this.enableSimulationMode();
                    return;
                }

                logger.info('Advertising started...');
                this.setupServices();
            });

            bleno.on('accept', (clientAddress) => {
                logger.info('Client connected:', clientAddress);
                this.isConnected = true;
            });

            bleno.on('disconnect', (clientAddress) => {
                logger.info('Client disconnected:', clientAddress);
                this.isConnected = false;
            });

        } catch (error) {
            logger.error('Bluetooth initialization error:', error);
            this.enableSimulationMode();
        }
    }

    private startAdvertising() {
        logger.info('Starting advertisement...');
        bleno.startAdvertising(this.NAME, ['fff0'], (error) => {
            if (error) {
                logger.error('Advertisement error:', error);
                this.enableSimulationMode();
            }
        });
    }

    private setupServices() {
        logger.info('Setting up services...');
        bleno.setServices([this.robotService], (error) => {
            if (error) {
                logger.error('Service setup error:', error);
                this.enableSimulationMode();
            } else {
                logger.info('Services set up successfully');
            }
        });

        this.robotService.characteristic.setUpdateValueCallback((data) => {
            this.handleIncomingData(data);
        });
    }

    private handleIncomingData(data: Buffer) {
        logger.info('Received data:', data);
    }

    private enableSimulationMode() {
        if (!this.isSimulated) {
            logger.info('Enabling simulation mode');
            this.isSimulated = true;
        }
    }

    async moveMainColumn(angle: number) {
        const command = Buffer.from([
            0x0C, 0x00, 
            0x00, 
            0x00, 
            0x80, 
            0x00, 
            0x00, 
            angle & 0xFF,
            (angle >> 8) & 0xFF
        ]);

        if (this.isSimulated) {
            logger.info('Simulation: Moving main column to angle:', angle);
            return;
        }

        try {
            if (this.isConnected) {
                this.robotService.characteristic.onWriteRequest(
                    command,
                    0,
                    true,
                    (result) => {
                        if (result !== 0) {
                            logger.error('Error sending command');
                        }
                    }
                );
            }
        } catch (error) {
            logger.error('Error moving main column:', error);
            this.enableSimulationMode();
        }
    }

    async moveUpperArm(angle: number) {
        const command = Buffer.from([
            0x0C, 0x00,
            0x00,
            0x00,
            0x80,
            0x01,
            0x00,
            angle & 0xFF,
            (angle >> 8) & 0xFF
        ]);

        if (this.isSimulated) {
            logger.info('Simulation: Moving upper arm to angle:', angle);
            return;
        }

        try {
            if (this.isConnected) {
                this.robotService.characteristic.onWriteRequest(
                    command,
                    0,
                    true,
                    (result) => {
                        if (result !== 0) {
                            logger.error('Error sending command');
                        }
                    }
                );
            }
        } catch (error) {
            logger.error('Error moving upper arm:', error);
            this.enableSimulationMode();
        }
    }

    async moveWrist(angle: number) {
        const command = Buffer.from([
            0x0C, 0x00,
            0x00,
            0x00,
            0x80,
            0x02,
            0x00,
            angle & 0xFF,
            (angle >> 8) & 0xFF
        ]);

        if (this.isSimulated) {
            logger.info('Simulation: Moving wrist to angle:', angle);
            return;
        }

        try {
            if (this.isConnected) {
                this.robotService.characteristic.onWriteRequest(
                    command,
                    0,
                    true,
                    (result) => {
                        if (result !== 0) {
                            logger.error('Error sending command');
                        }
                    }
                );
            }
        } catch (error) {
            logger.error('Error moving wrist:', error);
            this.enableSimulationMode();
        }
    }

    async moveGripper(distance: number) {
        const command = Buffer.from([
            0x0C, 0x00,
            0x00,
            0x00,
            0x80,
            0x03,
            0x00,
            distance & 0xFF,
            (distance >> 8) & 0xFF
        ]);

        if (this.isSimulated) {
            logger.info('Simulation: Moving gripper to distance:', distance);
            return;
        }

        try {
            if (this.isConnected) {
                this.robotService.characteristic.onWriteRequest(
                    command,
                    0,
                    true,
                    (result) => {
                        if (result !== 0) {
                            logger.error('Error sending command');
                        }
                    }
                );
            }
        } catch (error) {
            logger.error('Error moving gripper:', error);
            this.enableSimulationMode();
        }
    }

    async disconnect() {
        if (this.isConnected) {
            bleno.stopAdvertising();
            this.isConnected = false;
            logger.info('Bluetooth disconnected');
        }
    }
}

export default MacBluetoothClient;