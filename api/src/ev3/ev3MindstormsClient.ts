import { SerialPort } from 'serialport';
import logger from '../config/logger';

class EV3BrickProtocol {
    // Command types
    private static readonly SYSTEM_COMMAND_REPLY = 0x01;
    private static readonly SYSTEM_COMMAND_NO_REPLY = 0x81;
    private static readonly DIRECT_COMMAND_REPLY = 0x00;
    private static readonly DIRECT_COMMAND_NO_REPLY = 0x80;

    // Command bytes
    private static readonly opOUTPUT_SPEED = 0xA5;
    private static readonly opOUTPUT_START = 0xA6;
    private static readonly opOUTPUT_STEP_POWER = 0xAC;

    static createMotorCommand(port: number, speed: number, degrees: number): Buffer {
        // Calculate command length
        const commandLength = 11;
        
        // Create command buffer
        const command = Buffer.alloc(commandLength + 2); // +2 for length bytes
        let offset = 0;

        // Length bytes - Little endian
        command.writeUInt16LE(commandLength, offset);
        offset += 2;

        // Message counter
        command[offset++] = 0x00;
        command[offset++] = 0x00;

        // Command type - Direct command, no reply
        command[offset++] = this.DIRECT_COMMAND_NO_REPLY;

        // Global and local variables - None
        command[offset++] = 0x00;
        command[offset++] = 0x00;

        // Motor command sequence
        command[offset++] = this.opOUTPUT_SPEED;  // Set speed command
        command[offset++] = port;                 // Output port
        command[offset++] = speed;                // Power/Speed value

        command[offset++] = this.opOUTPUT_STEP_POWER; // Step power command
        command[offset++] = port;                     // Output port

        // Degrees (positions steps)
        command.writeInt32LE(degrees, offset);
        
        return command;
    }
}

class EV3MindstormsClient {
    private serialPort: SerialPort | null = null;
    private isConnected: boolean = false;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        try {
            logger.info('Initializing EV3 connection...');

            this.serialPort = new SerialPort({
                path: '/dev/cu.EVA',
                baudRate: 115200,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                rtscts: true
            });

            this.serialPort.on('open', () => {
                logger.info('Serial port opened');
                this.isConnected = true;
                this.setupDataLogging();
            });

            this.serialPort.on('error', (error) => {
                logger.error('Serial port error:', error);
            });

        } catch (error) {
            logger.error('Initialization failed:', error);
        }
    }

    private setupDataLogging() {
        if (!this.serialPort) return;

        // Set up binary data logging
        let buffer = Buffer.alloc(0);
        
        this.serialPort.on('data', (data: Buffer) => {
            buffer = Buffer.concat([buffer, data]);
            
            // Log every byte we receive
            logger.info('Received data:', {
                hex: data.toString('hex'),
                bytes: Array.from(data),
                ascii: data.toString('ascii'),
                buffer: buffer.toString('hex')
            });

            // Clear buffer if it gets too large
            if (buffer.length > 1024) {
                buffer = Buffer.alloc(0);
            }
        });
    }

    async moveBase(angle: number) {
        try {
            logger.info('Moving base motor:', { angle });

            if (!this.serialPort?.isOpen) {
                throw new Error('Serial port not open');
            }

            // Port A (0x01), speed 50, angle in degrees
            const command = EV3BrickProtocol.createMotorCommand(0x01, 50, angle);

            logger.debug('Sending command:', {
                hex: command.toString('hex'),
                bytes: Array.from(command),
                length: command.length
            });

            await new Promise<void>((resolve, reject) => {
                this.serialPort!.write(command, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    
                    this.serialPort!.drain(() => {
                        logger.info('Command sent successfully');
                        resolve();
                    });
                });
            });

            // Start the motor
            const startCommand = Buffer.from([
                0x06, 0x00,  // Length
                0x00, 0x00,  // Counter
                0x80,        // Direct command, no reply
                0x00,        // No vars
                0xA6,        // opOUTPUT_START
                0x01         // Port A
            ]);

            await new Promise<void>((resolve, reject) => {
                this.serialPort!.write(startCommand, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    
                    this.serialPort!.drain(() => {
                        logger.info('Start command sent successfully');
                        resolve();
                    });
                });
            });

        } catch (error) {
            logger.error('Move base error:', error);
            throw error;
        }
    }
}

export default EV3MindstormsClient;