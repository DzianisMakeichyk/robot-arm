import noble from '@abandonware/noble';
import { exec } from 'child_process';
import logger from '../config/logger';
import { promisify } from 'util';

const execAsync = promisify(exec);
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
    private readonly EV3_ADDRESS = '00:16:53:80:5C:A5';
    private readonly EV3_UUID = '0947c3ee3f9b3e84b35dc8c9e9f70afe';
    // private readonly EV3_UUID = '74670fb1e8773f29a36b1ff4de94bd66';
    // private readonly EV3_UUID = 'a4ee1d3ea4ca72bb4d5107e75a150133'; waiting
    // private readonly EV3_UUID = '6a0b29cdc4f11d17c3740af26e16df21'; waiting
    // private readonly EV3_UUID = '01a5280305e8729b666957de17242945'; scanning
    // private readonly EV3_UUID = 'e14cfa4b416b247c7392349c6248b376'; scanning
    // private readonly EV3_UUID = 'b9b95306b76e60a47d05113f4a9703ae';

    // {"level":"info","message":"Found device:","uuid":"b9d0cabb8363c8cbde07f17fbbd06bf5"}
    // {"level":"info","message":"Found device:","uuid":"b9b95306b76e60a47d05113f4a9703ae"}
    // {"level":"info","message":"Found device:","uuid":"1f7444e0973f4de069c100a3172284b4"}
    // {"level":"info","message":"Found device:","uuid":"b03ef4186b0d7f58bfa8b5ec1b85e6a9"}
    // {"level":"info","message":"Found device:","uuid":"7d513c0580e2a3b246bccb566c9da042"}

    private readonly SERVICE_UUID = '00001101-0000-1000-8000-00805f9b34fb';
    private readonly CHARACTERISTIC_UUID = '00001101-0000-1000-8000-00805f9b34fb';
    private readonly ID = '001653805ca5';
    private readonly GENERIC = '0x1801';

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

    // {"address":"","level":"info","manufacturerData":"4c0010073b1fa183dc4738","message":"Found device:","uuid":"0947c3ee3f9b3e84b35dc8c9e9f70afe"}

    private async initialize() {
        try {
            logger.info('Initializing Bluetooth connection to EV3');

            // Get paired devices using system command
            const { stdout } = await execAsync('system_profiler SPBluetoothDataType -json');
            const bluetoothData = JSON.parse(stdout);
            
            logger.info('Connected Bluetooth devices:', 
                bluetoothData?.SPBluetoothDataType?.[0]?.device_connected || []);

            // Look for EV3 in connected devices
            const devices = bluetoothData?.SPBluetoothDataType?.[0]?.device_connected || [];

            const ev3Device = devices.find((device: any) => device.hasOwnProperty('EVA'));
            // const ev3Device = devices.find((device: any) => 
            //     device.device_address === this.EV3_ADDRESS
            // );

            if (ev3Device) {
                logger.info('Found EV3 in system devices:', ev3Device);
                await this.connectToKnownDevice(ev3Device);
            } else {
                logger.error('EV3 not found in paired devices');
                this.enableSimulationMode();
            }

        } catch (error) {
            logger.error('Bluetooth initialization error:', error);
            this.enableSimulationMode();
        }
    }

    private async connectToKnownDevice(deviceInfo: any) {
        try {
            logger.info('noble =>',noble);

            noble.on('stateChange', (state) => {
                if (state === 'poweredOn') {
                    logger.info('poweredOn => Bluetooth powered on, scanning for EV3...');
                    noble.startScanning([this.GENERIC], false);
                } else {
                    logger.info('stopScanning!!!');
                    noble.stopScanning();
                }
            });



            // if (noble._state === 'poweredOn') {
            //     noble.once('stateChange', async (state) => {
            //         if (state === 'poweredOn') {
            //             logger.info('stateChange => Bluetooth powered on, scanning for EV3...');
            //             await noble.startScanningAsync(['180f'], false);
            //         } else {
            //             logger.error('Bluetooth not enabled or unavailable.');
            //         }
            //     });
            // }



            // noble.on('stateChange', async (state: string) => {
            //     if (state === 'poweredOn') {
            //         await noble.startScanningAsync([this.SERVICE_UUID], false);
            //     } else {
            //         console.error('Bluetooth not enabled or unavailable.');
            //     }
            // });

            noble.on('discover', async (peripheral: any) => {
                logger.info('------------------------------------');
                logger.info('peripheral:', peripheral);
                logger.info('------------------------------------');
                if (peripheral.address === this.EV3_ADDRESS) {
                    logger.info('Found matching EV3, connecting...');
                    await this.connectDevice(peripheral);
                } else {
                    logger.info('WOOOOOOOW:', peripheral);
                }
            });

        } catch (error) {
            logger.error('Error connecting to known device:', error);
            this.enableSimulationMode();
        }
    }

    private async connectDevice(peripheral: any) {
        try {
            logger.info('=== Starting EV3 Connection Process ===');
            logger.info('1. Stopping scan...');
            await noble.stopScanningAsync();
    
            logger.info('2. Attempting to connect to EV3...');
            await peripheral.connectAsync();
            logger.info('✓ Connected to peripheral!');
    
            logger.info('3. Discovering services...');
            const services = await peripheral.discoverServicesAsync([this.SERVICE_UUID]);
            logger.info(`✓ Found ${services.length} services`);
    
            if (services.length === 0) {
                throw new Error('No services found on EV3');
            }
    
            logger.info('4. Discovering characteristics...');
            const characteristics = await services[0].discoverCharacteristicsAsync([this.CHARACTERISTIC_UUID]);
            logger.info(`✓ Found ${characteristics.length} characteristics`);
    
            if (characteristics.length === 0) {
                throw new Error('No characteristics found on EV3');
            }
    
            this.characteristic = characteristics[0];
            this.isConnected = true;
    
            logger.info('=== EV3 CONNECTION SUCCESSFUL! ===');
            logger.info('Connection details:', {
                deviceName: peripheral.advertisement?.localName,
                deviceAddress: peripheral.address,
                rssi: peripheral.rssi,
                serviceUUID: services[0].uuid,
                characteristicUUID: this.characteristic.uuid
            });
    
            // Set up disconnect handler
            peripheral.once('disconnect', () => {
                logger.info('=== EV3 DISCONNECTED ===');
                this.isConnected = false;
                this.characteristic = null;
                // Optionally try to reconnect
                this.initialize();
            });
    
            return true;
    
        } catch (error) {
            logger.error('=== EV3 CONNECTION FAILED ===');
            logger.error('Connection error details:', error);
            this.enableSimulationMode();
            return false;
        }
    }
    
    // Add a method to check connection status
    public isDeviceConnected(): boolean {
        const status = {
            isConnected: this.isConnected,
            hasCharacteristic: !!this.characteristic,
            isSimulated: this.isSimulated
        };
        
        logger.info('EV3 Connection Status:', status);
        return this.isConnected && !this.isSimulated;
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