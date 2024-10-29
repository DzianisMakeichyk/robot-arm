import { SerialPort } from 'serialport';
import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../config/logger';

const execAsync = promisify(exec);

class EV3MindstormsClient {
    private serialPort: SerialPort | null = null;
    private isConnected: boolean = false;
    private readonly PORT_PATH = '/dev/cu.EVA';
    private readonly BAUD_RATE = 115200;

    constructor() {
        this.initialize().catch(err => {
            logger.error('Initialization failed:', err);
        });
    }

    private async checkPort(): Promise<void> {
        try {
            // Check if port exists
            const { stdout: lsOutput } = await execAsync('ls -l /dev/cu.EVA');
            logger.info('Port file info:', lsOutput.trim());

            // Check if port is in use
            const { stdout: lsofOutput } = await execAsync('lsof /dev/cu.EVA || true');
            if (lsofOutput.trim()) {
                logger.warn('Port is in use:', lsofOutput.trim());
                await execAsync('sudo kill -9 $(lsof -t /dev/cu.EVA) || true');
                logger.info('Killed existing processes using the port');
            }

            // Set permissions
            await execAsync('sudo chmod 666 /dev/cu.EVA');
            logger.info('Updated port permissions');
        } catch (error) {
            logger.error('Port check failed:', error);
            throw error;
        }
    }

    private async initialize(): Promise<void> {
        try {
            logger.info('Starting initialization...');
            
            // First check port
            await this.checkPort();

            // List available ports
            const ports = await SerialPort.list();
            logger.info('Available ports:', ports);

            // Close any existing connections
            if (this.serialPort?.isOpen) {
                logger.info('Closing existing connection...');
                await new Promise<void>(resolve => {
                    this.serialPort?.close(() => resolve());
                });
            }

            // Create new connection with detailed logging
            return new Promise((resolve, reject) => {
                logger.info('Creating new serial port...');
                
                this.serialPort = new SerialPort({
                    path: this.PORT_PATH,
                    baudRate: this.BAUD_RATE,
                    dataBits: 8,
                    stopBits: 1,
                    parity: 'none',
                    rtscts: true,
                    autoOpen: false,
                    lock: false
                }); // false for no auto-open

                this.serialPort.on('error', (error) => {
                    logger.error('Serial port error:', error);
                    this.isConnected = false;
                });

                logger.info('Opening port...');
                this.serialPort.open((error) => {
                    if (error) {
                        logger.error('Failed to open port:', error);
                        reject(error);
                        return;
                    }

                    logger.info('Port opened successfully');
                    this.isConnected = true;
                    
                    // Send test message
                    const testMsg = Buffer.from([0xFF, 0x00]);
                    this.serialPort?.write(testMsg, (err) => {
                        if (err) {
                            logger.error('Test write failed:', err);
                        } else {
                            logger.info('Test write successful');
                        }
                    });

                    resolve();
                });
            });

        } catch (error) {
            logger.error('Initialization error:', error);
            throw error;
        }
    }

    async moveBase(angle: number) {
        try {
            if (!this.serialPort?.isOpen) {
                // Try to reinitialize if port is closed
                logger.info('Port closed, attempting to reinitialize...');
                await this.initialize();
            }

            if (!this.serialPort?.isOpen) {
                throw new Error('Could not open serial port');
            }

            const command = Buffer.from([
                0x0D, 0x00,        // Length
                0x00, 0x00,        // Counter
                0x80,              // Direct command
                0xAE,              // Step speed command
                0x00,              // Layer
                0x01,              // Port A
                30,                // Speed
                angle & 0xFF,      // Angle LSB
                (angle >> 8) & 0xFF // Angle MSB
            ]);

            return new Promise<void>((resolve, reject) => {
                this.serialPort!.write(command, (error) => {
                    if (error) {
                        logger.error('Write error:', error);
                        reject(error);
                        return;
                    }

                    this.serialPort!.drain(() => {
                        logger.info('Command sent successfully:', {
                            hex: command.toString('hex'),
                            angle
                        });
                        resolve();
                    });
                });
            });
        } catch (error) {
            logger.error('Move base error:', error);
            throw error;
        }
    }

    public getStatus() {
        return {
            portPath: this.PORT_PATH,
            isConnected: this.isConnected,
            portOpen: this.serialPort?.isOpen || false,
            settings: this.serialPort?.settings
        };
    }
}

export default EV3MindstormsClient;