import noble from '@abandonware/noble';
import logger from '../config/logger';
import { 
  MotorPorts, 
  SensorPorts, 
  MotorConfig, 
  SensorConfig,
  motorPortToHex 
} from './portConfig';

class MacBluetoothClient {
    private isConnected: boolean = false;
    private isSimulated: boolean = false;
    private characteristic: any = null;
    private readonly EV3_ADDRESS: string = '00:16:53:80:5C:A5';
    private readonly SERVICE_UUID = 'fff0';
    private readonly CHARACTERISTIC_UUID = 'fff1';

    /**
     * EV3 Direct Command Format:
     * [0x0C] - Direct command, response expected
     * [0x00] - Header size
     * [0x00] - Counter
     * [0x00] - Command type
     * [0x80] - Output power
     * [PORT] - Output port (0x00 to 0x03 for motors A-D)
     * [0x00] - Command subtype
     * [Angle LSB] - Lower byte of angle
     * [Angle MSB] - Upper byte of angle
     */

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

    async moveBase(angle: number) {
      const config = MotorConfig[MotorPorts.BASE];
      const clampedAngle = Math.max(
          config.minDegrees,
          Math.min(config.maxDegrees, angle)
      );

      const command = this.createMotorCommand(
          config.portNumber,
          clampedAngle,
          config.defaultSpeed
      );

      logger.info(`------------------------------------`);
      logger.info(`====>>>>>  Moving base (Port ${MotorPorts.BASE}) to ${clampedAngle}°`);
      logger.info(`------------------------------------`);
      await this.sendCommand(command);
  }

  async moveElbow(angle: number) {
      const config = MotorConfig[MotorPorts.ELBOW];
      const clampedAngle = Math.max(
          config.minDegrees,
          Math.min(config.maxDegrees, angle)
      );

      const command = this.createMotorCommand(
          config.portNumber,
          clampedAngle,
          config.defaultSpeed
      );

      logger.info(`------------------------------------`);
      logger.info(`====>>>>> Moving elbow (Port ${MotorPorts.ELBOW}) to ${clampedAngle}°`);
      logger.info(`------------------------------------`);
      await this.sendCommand(command);
  }

  async moveHeight(angle: number) {
      const config = MotorConfig[MotorPorts.HEIGHT];
      const clampedAngle = Math.max(
          config.minDegrees,
          Math.min(config.maxDegrees, angle)
      );

      const command = this.createMotorCommand(
          config.portNumber,
          clampedAngle,
          config.defaultSpeed
      );

      logger.info(`------------------------------------`);
      logger.info(`====>>>>> Adjusting height (Port ${MotorPorts.HEIGHT}) to ${clampedAngle}°`);
      logger.info(`------------------------------------`);
      await this.sendCommand(command);
  }

  async moveGripper(position: number) {
      const config = MotorConfig[MotorPorts.GRIPPER];
      // Convert position (0-100) to degrees
      const angle = (position / 100) * (config.maxDegrees - config.minDegrees);
      const clampedAngle = Math.max(
          config.minDegrees,
          Math.min(config.maxDegrees, angle)
      );

      const command = this.createMotorCommand(
          config.portNumber,
          clampedAngle,
          config.defaultSpeed
      );

      logger.info(`Moving gripper (Port ${MotorPorts.GRIPPER}) to ${clampedAngle}°`);
      await this.sendCommand(command);
  }

  private createMotorCommand(port: number, angle: number, speed: number): Buffer {
      return Buffer.from([
          0x0C,                   // Direct command
          0x00,                   // Header size
          0x00,                   // Counter
          0x00,                   // Command type
          speed,                  // Motor speed
          port,                   // Motor port
          0x00,                   // Subtype
          angle & 0xFF,           // Angle LSB
          (angle >> 8) & 0xFF     // Angle MSB
      ]);
  }

  async readTouchSensor(): Promise<boolean> {
      // Implementation for reading touch sensor
      // This would be used for base position calibration
      return false; // Placeholder
  }

  async calibrateBasePosition() {
      try {
          logger.info('Starting base position calibration...');
          // Implementation for base calibration using touch sensor
      } catch (error) {
          logger.error('Calibration error:', error);
      }
  }
}

export default MacBluetoothClient;