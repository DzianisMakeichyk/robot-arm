import { SerialPort } from 'serialport';
import logger from '../config/logger';

class EV3BluetoothClient {
    private serialPort: SerialPort | null = null;
    private isConnected: boolean = false;
    private isSimulated: boolean = false;

    // Message constants
    private readonly START_BYTE = 0x02;
    private readonly END_BYTE = 0x03;
    private readonly ESCAPE_BYTE = 0x1B;
    private messageCounter = 0;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        try {
            logger.info('Initializing EV3 Bluetooth connection...');
            
            this.serialPort = new SerialPort({
                path: '/dev/cu.EVA',
                baudRate: 115200,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                rtscts: false // Changed to false
            });

            this.serialPort.on('open', () => {
                logger.info('Serial port opened');
                // Allow port to stabilize
                setTimeout(() => this.startConnection(), 1000);
            });

            // Handle incoming data
            let buffer = Buffer.alloc(0);
            this.serialPort.on('data', (data) => {
                buffer = Buffer.concat([buffer, data]);
                this.processIncomingData(buffer);
                buffer = Buffer.alloc(0); // Clear buffer after processing
            });

            this.serialPort.on('error', (error) => {
                logger.error('Serial port error:', error);
                this.enableSimulationMode();
            });

        } catch (error) {
            logger.error('Failed to initialize:', error);
            this.enableSimulationMode();
        }
    }

    private async startConnection() {
        try {
            logger.info('Starting EV3 connection sequence...');
            
            // Send sync bytes
            await this.sendRawCommand(Buffer.from([0xFF, 0xFF, 0x00]));
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Send initial ping
            const pingCmd = this.createCommand(0x00, Buffer.from([0x01]));
            await this.sendRawCommand(pingCmd);
            
            this.isConnected = true;
            logger.info('EV3 connection sequence completed');
            
        } catch (error) {
            logger.error('Connection sequence failed:', error);
            this.enableSimulationMode();
        }
    }

    private createCommand(type: number, payload: Buffer): Buffer {
        const length = payload.length + 2; // +2 for counter and type
        const header = Buffer.alloc(3);
        header[0] = this.START_BYTE;
        header[1] = length & 0xFF;
        header[2] = (length >> 8) & 0xFF;

        const body = Buffer.alloc(2 + payload.length);
        body[0] = this.messageCounter++ & 0xFF;
        body[1] = type;
        payload.copy(body, 2);

        const command = Buffer.concat([
            header,
            body,
            Buffer.from([this.END_BYTE])
        ]);

        logger.debug('Created command:', {
            type: type.toString(16),
            payload: payload.toString('hex'),
            command: command.toString('hex')
        });

        return command;
    }

    private async sendRawCommand(command: Buffer): Promise<void> {
        if (this.isSimulated) {
            logger.info('Simulation mode - Command:', command.toString('hex'));
            return;
        }

        return new Promise((resolve, reject) => {
            this.serialPort?.write(command, (error) => {
                if (error) {
                    logger.error('Write error:', error);
                    reject(error);
                    return;
                }

                this.serialPort?.drain(() => {
                    logger.debug('Command sent:', command.toString('hex'));
                    resolve();
                });
            });
        });
    }

    private processIncomingData(data: Buffer) {
        logger.info('Received data:', {
            hex: data.toString('hex'),
            ascii: data.toString('ascii'),
            bytes: Array.from(data)
        });
    }

    async moveBase(angle: number) {
        try {
            logger.info('Moving base motor:', { angle });
            
            // Convert angle to bytes
            const angleBytes = Buffer.alloc(4);
            angleBytes.writeInt32LE(angle, 0);

            // Create motor command
            const command = Buffer.concat([
                Buffer.from([0x0A]), // Direct command
                Buffer.from([0x00]), // No reply
                Buffer.from([0x00]), // Global vars
                Buffer.from([0xA4]), // opOUTPUT_STEP_POWER
                Buffer.from([0x00]), // Layer
                Buffer.from([0x01]), // Port A
                Buffer.from([30]),   // Power
                angleBytes           // Angle
            ]);

            await this.sendRawCommand(this.createCommand(0x80, command));
            logger.info('Motor command sent');

        } catch (error) {
            logger.error('Error moving base:', error);
            throw error;
        }
    }

    private enableSimulationMode() {
        if (!this.isSimulated) {
            logger.info('Enabling simulation mode');
            this.isSimulated = true;
        }
    }
}

export default EV3BluetoothClient;