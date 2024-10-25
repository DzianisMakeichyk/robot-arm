import noble from '@abandonware/noble';
import logger from '../config/logger';

class MacBluetoothClient {
    private isConnected: boolean = false;
    private isSimulated: boolean = false;
    private characteristic: any = null;
    private readonly EV3_ADDRESS: string = '00:16:53:80:5C:A5';
    private readonly SERVICE_UUID = 'fff0';
    private readonly CHARACTERISTIC_UUID = 'fff1';

    constructor() {
        this.initialize();
    }

    private initialize() {
        try {
            logger.info('Initializing EV3 Bluetooth connection...');

            noble.on('stateChange', async (state) => {
                logger.info('Bluetooth state:', state);
                if (state === 'poweredOn') {
                    await this.startScanningForEV3();
                } else {
                    noble.stopScanning();
                }
            });

            noble.on('discover', async (peripheral) => {
                logger.info('Found device:', peripheral.address);
                if (peripheral.address === this.EV3_ADDRESS || 
                    peripheral.advertisement.localName === 'EV3') {
                    await this.connectToEV3(peripheral);
                }
            });

        } catch (error) {
            logger.error('Bluetooth initialization error:', error);
            this.enableSimulationMode();
        }
    }

    private async startScanningForEV3() {
        try {
            logger.info('Starting scan for EV3...');
            await noble.startScanningAsync([this.SERVICE_UUID], false);
            
            // Stop scanning after 30 seconds if EV3 not found
            setTimeout(() => {
                if (!this.isConnected) {
                    noble.stopScanning();
                    logger.warn('EV3 not found after 30 seconds. Enabling simulation mode.');
                    this.enableSimulationMode();
                }
            }, 30000);

        } catch (error) {
            logger.error('Scan error:', error);
            this.enableSimulationMode();
        }
    }

    private async connectToEV3(peripheral: any) {
        try {
            logger.info('Connecting to EV3...');
            await noble.stopScanningAsync();

            await peripheral.connectAsync();
            logger.info('Connected to EV3');

            const services = await peripheral.discoverServicesAsync([this.SERVICE_UUID]);
            logger.info('Discovered services');

            if (services.length > 0) {
                const characteristics = await services[0].discoverCharacteristicsAsync([this.CHARACTERISTIC_UUID]);
                if (characteristics.length > 0) {
                    this.characteristic = characteristics[0];
                    this.isConnected = true;
                    logger.info('EV3 connection fully established');
                }
            }

            peripheral.on('disconnect', () => {
                logger.info('EV3 disconnected');
                this.isConnected = false;
                this.characteristic = null;
                setTimeout(() => this.startScanningForEV3(), 1000);
            });

        } catch (error) {
            logger.error('EV3 connection error:', error);
            this.enableSimulationMode();
        }
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

        if (!this.isConnected || !this.characteristic) {
            throw new Error('Not connected to EV3');
        }

        try {
            await this.characteristic.writeAsync(command, false);
            logger.info('Command sent successfully:', command);
        } catch (error) {
            logger.error('Error sending command:', error);
            this.enableSimulationMode();
            throw error;
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

        await this.sendCommand(command);
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

        await this.sendCommand(command);
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

        await this.sendCommand(command);
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

        await this.sendCommand(command);
    }

    async disconnect() {
        if (this.isConnected && this.characteristic) {
            try {
                await noble.stopScanningAsync();
                this.isConnected = false;
                this.characteristic = null;
                logger.info('Disconnected from EV3');
            } catch (error) {
                logger.error('Error disconnecting:', error);
            }
        }
    }
}

export default MacBluetoothClient;