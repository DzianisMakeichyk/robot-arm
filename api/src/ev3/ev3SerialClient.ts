import { SerialPort } from 'serialport';
import logger from '../config/logger';
import { 
    MotorPorts, 
    MotorConfig,
    motorPortToHex 
} from './portConfig';
import { EV3Protocol } from './ev3Protocol';

class EV3SerialClient {
    private serialPort: SerialPort | null = null;
    private isConnected: boolean = false;
    private isSimulated: boolean = false;
    private commandQueue: Array<() => Promise<void>> = [];
    private isProcessingQueue = false;
    private readonly PORT_PATH = '/dev/cu.EVA';

  constructor() {
      logger.info('Starting EV3 Serial Client...');
      this.initialize();
  }

  async testConnection(): Promise<boolean> {
    try {
        logger.info('Running connection test sequence...');
        
        // Send version request and wait for response
        const versionCmd = EV3Protocol.createGetVersionCommand();
        await this.sendCommand(versionCmd);
        
        // Wait for response
        const hasResponse = await new Promise<boolean>((resolve) => {
            const timeout = setTimeout(() => resolve(false), 1000);
            
            const responseHandler = (data: Buffer) => {
                clearTimeout(timeout);
                this.serialPort?.removeListener('data', responseHandler);
                resolve(true);
            };
            
            this.serialPort?.once('data', responseHandler);
        });

        if (!hasResponse) {
            logger.error('No response received from EV3');
            return false;
        }

        logger.info('EV3 responded to test sequence');
        return true;

    } catch (error) {
        logger.error('Connection test failed:', error);
        return false;
    }
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
            this.verifyConnection();
        });

        this.serialPort.on('data', (data) => {
            logger.info('Received data from EV3:', {
                hex: data.toString('hex'),
                bytes: Array.from(data),
                ascii: data.toString('ascii')
            });
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

    private async verifyConnection() {
        try {
            logger.info('Verifying EV3 connection...');

            // Send version request
            const versionCmd = EV3Protocol.createGetVersionCommand();
            await this.sendCommand(versionCmd);
            logger.info('Version command sent, waiting for response...');

            // Wait a bit and send ping
            await new Promise(resolve => setTimeout(resolve, 100));
            const pingCmd = EV3Protocol.createPingCommand();
            await this.sendCommand(pingCmd);
            logger.info('Ping command sent, waiting for response...');

        } catch (error) {
            logger.error('Connection verification failed:', error);
        }
    }

    private enableSimulationMode() {
        if (!this.isSimulated) {
            logger.info('Enabling simulation mode');
            this.isSimulated = true;
        }
    }

private async sendCommand(command: Buffer): Promise<void> {
        if (this.isSimulated) {
            logger.info('Simulation mode - Command:', command);
            return;
        }

        return new Promise((resolve, reject) => {
            if (!this.serialPort?.isOpen) {
                reject(new Error('Serial port not open'));
                return;
            }

            logger.debug('Sending command:', {
                hex: command.toString('hex'),
                bytes: Array.from(command)
            });

            this.serialPort.write(command, (error) => {
                if (error) {
                    logger.error('Write error:', error);
                    reject(error);
                    return;
                }

                this.serialPort?.drain((error) => {
                    if (error) {
                        logger.error('Drain error:', error);
                        reject(error);
                        return;
                    }

                    logger.debug('Command sent and drained');
                    resolve();
                });
            });
        });
    }

    public getConnectionStatus() {
      return {
          isConnected: this.isConnected,
          isSimulated: this.isSimulated,
          portOpen: this.serialPort?.isOpen || false,
          portPath: this.PORT_PATH
      };
  }

  async moveBase(angle: number) {
    try {
        const config = MotorConfig[MotorPorts.BASE];
        const clampedAngle = Math.max(
            config.minDegrees,
            Math.min(config.maxDegrees, angle)
        );

        logger.info('Moving base motor:', {
            requestedAngle: angle,
            clampedAngle,
            port: MotorPorts.BASE
        });

        const command = EV3Protocol.createMotorCommand(
            config.portNumber,
            30, // power level
            clampedAngle
        );

        await this.sendCommand(command);
        logger.info('Base motor command sent');

    } catch (error) {
        logger.error('Error moving base:', error);
        throw error;
    }
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
                this.serialPort.close();
                this.isConnected = false;
                logger.info('Serial connection closed');
            }
        } catch (error) {
            logger.error('Disconnect error:', error);
        }
    }

    async testMotors() {
      if (!this.isConnected) {
          logger.error('Cannot test motors: Not connected');
          return;
      }

      try {
          logger.info('Starting motor test sequence...');

          // Test base motor
          logger.info('Testing BASE motor...');
          await this.moveBase(45);
          await this.delay(2000);
          await this.moveBase(0);
          await this.delay(1000);

          // Test elbow motor
          logger.info('Testing ELBOW motor...');
          await this.moveElbow(45);
          await this.delay(2000);
          await this.moveElbow(0);
          await this.delay(1000);

          // Test height motor
          logger.info('Testing HEIGHT motor...');
          await this.moveHeight(45);
          await this.delay(2000);
          await this.moveHeight(0);
          await this.delay(1000);

          // Test gripper
          logger.info('Testing GRIPPER...');
          await this.moveGripper(50);
          await this.delay(2000);
          await this.moveGripper(0);

          logger.info('Motor test sequence completed');
      } catch (error) {
          logger.error('Motor test failed:', error);
      }
  }

  private delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default EV3SerialClient;