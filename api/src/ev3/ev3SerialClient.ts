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
  private readonly BAUD_RATE = 115200;
  private readonly PORT_PATH = '/dev/cu.EVA';

  constructor() {
      logger.info('Starting EV3 Serial Client...');
      this.initialize();
  }

  private async initialize() {
      try {
          logger.info(`Attempting to connect to ${this.PORT_PATH}...`);

          this.serialPort = new SerialPort({
              path: this.PORT_PATH,
              baudRate: this.BAUD_RATE,
              dataBits: 8,
              stopBits: 1,
              parity: 'none',
              autoOpen: false
          });

          // Setup event handlers
          this.serialPort.on('open', () => {
              this.isConnected = true;
              logger.info('✓ Serial connection OPENED successfully');
              this.validateConnection();
          });

          this.serialPort.on('close', () => {
              this.isConnected = false;
              logger.info('Serial connection CLOSED');
          });

          this.serialPort.on('error', (error) => {
              logger.error('Serial connection ERROR:', error);
              this.enableSimulationMode();
          });

          // Attempt to open the connection
          return new Promise((resolve, reject) => {
              this.serialPort?.open((error) => {
                  if (error) {
                      logger.error('Failed to open serial port:', error);
                      this.enableSimulationMode();
                      reject(error);
                  } else {
                      logger.info('Serial port opened, waiting for connection...');
                      resolve(true);
                  }
              });
          });

      } catch (error) {
          logger.error('Initialization error:', error);
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
                        logger.info('Command sent successfully:', command);
                        resolve(true);
                    });
                }
            });
        });
    }

    private async validateConnection() {
      try {
          if (!this.serialPort?.isOpen) {
              throw new Error('Serial port is not open');
          }

          // Send a test command
          const testCommand = Buffer.from([0x0F, 0x00, 0x00, 0x00, 0x00]); // Simple test command
          await this.sendCommand(testCommand);
          
          logger.info('✓ Connection validated successfully');
      } catch (error) {
          logger.error('Connection validation failed:', error);
          this.enableSimulationMode();
      }
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