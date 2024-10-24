import { createBluetooth } from 'node-ble';
import logger from '../config/logger';

class EV3Client {
    private bluetooth: any;
    private adapter: any;
    private device: any;
    private isConnected: boolean = false;
    private isSimulated: boolean = false;
    private readonly EV3_ADDRESS: string = '00:16:53:80:5C:A5';
    private readonly SERVICE_UUID = 'fff0';
    private readonly CHARACTERISTIC_UUID = 'fff1';
    private initializeRetries = 0;
    private maxInitializeRetries = 5;

    constructor() {
        this.initializeWithRetry();
    }

    private async initializeWithRetry() {
        try {
            // Wait for Bluetooth services to be fully initialized
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            await this.initializeConnection();
        } catch (error) {
            logger.error('Failed to initialize Bluetooth:', error);
            
            if (this.initializeRetries < this.maxInitializeRetries) {
                this.initializeRetries++;
                logger.info(`Retrying initialization (attempt ${this.initializeRetries}/${this.maxInitializeRetries})...`);
                setTimeout(() => this.initializeWithRetry(), 5000);
            } else {
                logger.error('Max initialization retries reached, enabling simulation mode');
                this.enableSimulationMode();
            }
        }
    }

    private async initializeConnection() {
        try {
            logger.info('Initializing Bluetooth connection...');
            
            const { bluetooth, destroy } = createBluetooth();
            this.bluetooth = bluetooth;

            // Get Bluetooth adapter
            logger.info('Getting Bluetooth adapter...');
            this.adapter = await this.bluetooth.defaultAdapter();
            
            if (!this.adapter) {
                throw new Error('No Bluetooth adapter found');
            }

            logger.info('Bluetooth adapter found');

            // Power on the adapter if it's not already
            if (!await this.adapter.isPowered()) {
                logger.info('Powering on Bluetooth adapter...');
                await this.adapter.setPowered(true);
            }

            // Start discovery if not already scanning
            if (!await this.adapter.isDiscovering()) {
                logger.info('Starting device discovery...');
                await this.adapter.startDiscovery();
            }

            logger.info('Searching for EV3 device...');
            await this.findAndConnect();

        } catch (error) {
            logger.error('Error in Bluetooth initialization:', error);
            throw error;
        }
    }

    private enableSimulationMode() {
        logger.info('Enabling simulation mode due to Bluetooth initialization failure');
        this.isSimulated = true;
        this.isConnected = true;
    }

    private async findAndConnect() {
        try {
            // Wait for the EV3 device to be discovered
            const device = await this.adapter.waitDevice(this.EV3_ADDRESS);
            this.device = device;

            logger.info('EV3 device found, attempting to connect...');

            if (!await this.device.isPaired()) {
                await this.device.pair();
                logger.info('Device paired successfully');
            }

            await this.device.connect();
            this.isConnected = true;
            logger.info('Connected to EV3');

            // Get GATT service
            const gattServer = await this.device.gatt();
            const service = await gattServer.getPrimaryService(this.SERVICE_UUID);
            const characteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID);

            this.setupDisconnectHandler();

        } catch (error) {
            logger.error('Error connecting to device:', error);
            this.enableSimulationMode();
        }
    }

    private setupDisconnectHandler() {
        if (this.device) {
            this.device.on('disconnect', async () => {
                logger.info('Device disconnected');
                this.isConnected = false;
                await this.findAndConnect();
            });
        }
    }

    async sendCommand(command: Buffer) {
        if (this.isSimulated) {
            logger.info('Simulation mode - Command logged:', command);
            return;
        }

        if (!this.isConnected) {
            logger.error('Not connected to EV3');
            return;
        }

        try {
            const characteristic = await this.device.getCharacteristic(this.CHARACTERISTIC_UUID);
            await characteristic.writeValue(command);
            logger.info('Command sent successfully:', command);
        } catch (error) {
            logger.error('Error sending command:', error);
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
        await this.sendCommand(command);
    }

    async disconnect() {
        if (this.isConnected && !this.isSimulated && this.device) {
            try {
                await this.device.disconnect();
                this.isConnected = false;
                logger.info('Disconnected from EV3');
            } catch (error) {
                logger.error('Error disconnecting:', error);
            }
        }
    }
}

export default EV3Client;