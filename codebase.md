# .gitignore

```
# dependencies
hmi/node_modules/
api/node_modules/

# IDE
.idea

# Docker
.docker

# MongoDB Data
data

# build
api/dist
api/debug.log

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

```

# api/bluetooth/main.conf

```conf
[General]
Name = RoboticArm
Class = 0x000100
DiscoverableTimeout = 0
```

# api/index.d.ts

```ts
declare module 'ev3dev-lang' {
  export class Motor {
      constructor(port: string);
      runToRelativePosition(position: number, speed: number): void;
      position: number;
  }
}
```

# api/nodemon.json

```json
{
  "watch": ["dist"],
  "ignore": ["dist/data/*", "*.test.js", "node_modules"],
  "ext": "js",
  "exec": "node dist/server.js"
}
```

# api/package.json

```json
{
  "name": "api",
  "version": "1.0.0",
  "description": "Lego arm API",
  "author": "Dzianis Makeichyk",
  "scripts": {
    "start": "node dist/server.js",
    "dev": "tsc && nodemon",
    "watch-ts": "tsc -w",
    "build": "tsc && npm run copy-data",
    "clean": "rm -rf dist",
    "copy-data": "mkdir -p dist/data && cp src/data/db.json dist/data/"
  },
  "dependencies": {
    "@abandonware/bleno": "^0.6.1",
    "@abandonware/noble": "^1.9.2-25",
    "@stoprocent/noble": "^1.15.1",
    "dotenv": "^16.4.1",
    "express": "^4.17.1",
    "lowdb": "^1.0.0",
    "node-ble": "^1.11.0",
    "socket.io": "^4.7.4",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/lowdb": "^1.0.9",
    "@types/node": "^20.11.10",
    "@types/socket.io": "^3.0.2",
    "concurrently": "^8.2.2",
    "nodemon": "^2.0.3",
    "typescript": "^5.3.3"
  }
}

```

# api/README.md

```md
# API

[EV3 BRICK - TOP VIEW]

Motor Ports: [A] [B] [C] [D]

1. Connect the main column (base rotation) motor to Port A
   - This controls the left/right rotation of the entire arm

2. Connect the upper arm motor to Port B
   - This controls the up/down movement of the main arm

3. Connect the wrist motor to Port C
   - This controls the wrist rotation

4. Connect the gripper motor to Port D
   - This controls the gripper open/close movement

Note: Use LARGE motors for A, B, C and a MEDIUM motor for D
```

# api/src/config/logger.ts

```ts
 
import winston from "winston"

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV === "production" ? "error" : "debug"
        }),
        new winston.transports.File({filename: "debug.log", level: "debug"})
    ]
})

if (process.env.NODE_ENV !== "production") {
    logger.debug("Logging initialized at debug level")
}

export default logger

```

# api/src/controllers/state.controller.ts

```ts
import { Socket } from 'socket.io';
import { RobotState } from '../models/RobotState';
import logger from '../config/logger';
import data from '../seed.json';
import MacBluetoothClient from '../ev3/macBluetoothClient';
import { MotorConfig, MotorPorts } from '../ev3/portConfig';

const bluetoothClient = new MacBluetoothClient();

/**
 * Convert 3D model rotations to H25 motor angles
 */
const convertToMotorAngle = (radians: number, motorType: keyof typeof MotorPorts): number => {
    // Convert radians to degrees
    let degrees = (radians * 180) / Math.PI;
    
    // Get motor configuration
    const config = MotorConfig[MotorPorts[motorType]];
    
    // Clamp to motor limits
    return Math.max(
        config.minDegrees,
        Math.min(config.maxDegrees, degrees)
    );
};

/**
 * Convert gripper position to motor angle
 */
const convertGripperPosition = (position: number): number => {
    const config = MotorConfig[MotorPorts.GRIPPER];
    // Convert position value to percentage (0-100)
    const percentage = ((position + 1) / 2) * 100;
    return Math.max(
        config.minDegrees,
        Math.min(config.maxDegrees, percentage)
    );
};

/**
 * Handle H25 robot movements based on 3D model state
 */
const handleH25Movements = async (newState: any) => {
    if (!newState.nodes) return;

    try {
        // Base rotation (main_column in 3D model maps to BASE motor)
        if (newState.nodes.main_column?.rotation?.[1] !== undefined) {
            const angle = convertToMotorAngle(newState.nodes.main_column.rotation[1], 'BASE');
            logger.info(`Moving base motor to ${angle}°`);
            await bluetoothClient.moveBase(angle);
        }

        // Elbow movement (upper_arm in 3D model maps to ELBOW motor)
        if (newState.nodes.upper_arm?.rotation?.[1] !== undefined) {
            const angle = convertToMotorAngle(newState.nodes.upper_arm.rotation[1], 'ELBOW');
            logger.info(`Moving elbow motor to ${angle}°`);
            await bluetoothClient.moveElbow(angle);
        }

        // Height adjustment (wrist_extension in 3D model maps to HEIGHT motor)
        if (newState.nodes.wrist_extension?.rotation?.[1] !== undefined) {
            const angle = convertToMotorAngle(newState.nodes.wrist_extension.rotation[1], 'HEIGHT');
            logger.info(`Moving height motor to ${angle}°`);
            await bluetoothClient.moveHeight(angle);
        }

        // Gripper control
        if (newState.nodes.gripper?.position?.[2] !== undefined) {
            const position = convertGripperPosition(newState.nodes.gripper.position[2]);
            logger.info(`Moving gripper motor to position ${position}`);
            await bluetoothClient.moveGripper(position);
        }

    } catch (error) {
        logger.error('Error handling H25 movements:', error);
    }
};

/**
 * Retrieve the current state of the Robot
 */
const getState = async (socket: Socket) => {
    const state = await RobotState.findOne();
    logger.info('state =>', state);
    socket.emit('state', state);
};

/**
 * Adding some initial seed data at startup if collection is empty
 */
export const seed = async () => {
    const state = await RobotState.find();
    if (state.length === 0) {
        logger.info('seeding');
        // @ts-ignore
        await RobotState.insertMany(data);
    } else {
        logger.info('not seeding');
    }
};

/**
 * Map the websocket events to controller methods
 */
export default function (socket: Socket) {
    // Handle initial connection
    socket.on('connect', () => {
        logger.info('Client connected, initializing H25 robot arm...');
        bluetoothClient.calibrateBasePosition()
            .catch(error => logger.error('Calibration error:', error));
    });

    // Handle state updates
    socket.on("state:update", async (newState: any) => {
        try {
            // logger.info('Received state update:', newState);
            await RobotState.findOneAndUpdate({}, newState);
            socket.emit('state', newState);
            // logger.info('State updated and emitted back');

            // Handle H25 movements
            await handleH25Movements(newState);

        } catch (error) {
            logger.error('Error updating state:', error);
            socket.emit('error', { message: 'Failed to update robot state' });
        }
    });

    // Handle state requests
    socket.on("state:get", () => {
        logger.info('Received state:get request');
        getState(socket);
    });

    // Handle calibration requests
    socket.on("calibrate", async () => {
        try {
            await bluetoothClient.calibrateBasePosition();
            socket.emit('calibration_complete');
        } catch (error) {
            logger.error('Calibration error:', error);
            socket.emit('error', { message: 'Calibration failed' });
        }
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
        try {
            // await bluetoothClient.disconnect();
            logger.info('NOOOOOOO:','Client disconnected, shutting down H25 connection');
        } catch (error) {
            logger.error('Error during disconnect:', error);
        }
    });
}
```

# api/src/ev3/blenoService.ts

```ts
import bleno from '@abandonware/bleno';
import logger from '../config/logger';

class RobotCharacteristic extends bleno.Characteristic {
    private _value: Buffer;
    private _updateCallback: ((data: Buffer) => void) | null = null;

    constructor() {
        super({
            uuid: 'fff1',
            properties: ['write', 'notify'],
            value: null
        });
        this._value = Buffer.alloc(0);
    }

    onWriteRequest(data: Buffer, offset: number, withoutResponse: boolean, callback: (result: number) => void) {
        this._value = data;
        if (this._updateCallback) {
            this._updateCallback(data);
        }
        callback(this.RESULT_SUCCESS);
    }

    setUpdateValueCallback(callback: (data: Buffer) => void) {
        this._updateCallback = callback;
    }
}

class RobotService extends bleno.PrimaryService {
    characteristic: RobotCharacteristic;

    constructor() {
        const characteristic = new RobotCharacteristic();
        
        super({
            uuid: 'fff0',
            characteristics: [characteristic]
        });

        this.characteristic = characteristic;
    }
}

export default RobotService;
```

# api/src/ev3/config.ts

```ts
export const EV3_CONFIG = {
  bluetoothAddress: '00:16:53:80:5C:A5',
  port: 1234
}
```

# api/src/ev3/ev3USBClient.ts

```ts
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
```

# api/src/ev3/macBluetoothClient.ts

```ts
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
```

# api/src/ev3/portConfig.ts

```ts
// Motor ports (A, B, C, D)
export const MotorPorts = {
  BASE: 'A',          // Base rotation (Large motor)
  ELBOW: 'B',         // Elbow joint (Large motor)
  HEIGHT: 'C',        // Height adjustment (Large motor)
  GRIPPER: 'D'        // Gripper (Medium motor)
} as const;

// Sensor ports (1, 2, 3, 4)
export const SensorPorts = {
  TOUCH: '1',         // Touch sensor for base position
  COLOR: '2',         // Color sensor (if used)
  GYRO: '3',          // Gyro sensor (if used)
  ULTRASONIC: '4'     // Ultrasonic sensor (if used)
} as const;

// Convert motor port letter to hex value for EV3 command
export const motorPortToHex = {
  'A': 0x00,
  'B': 0x01,
  'C': 0x02,
  'D': 0x03
} as const;

// Convert sensor port number to hex value
export const sensorPortToHex = {
  '1': 0x00,
  '2': 0x01,
  '3': 0x02,
  '4': 0x03
} as const;

// Motor configurations for H25 robot arm
export const MotorConfig = {
  [MotorPorts.BASE]: {
      type: 'LARGE',
      maxDegrees: 180,
      minDegrees: -180,
      defaultSpeed: 30,
      portNumber: motorPortToHex.A,
      description: 'Base rotation motor'
  },
  [MotorPorts.ELBOW]: {
      type: 'LARGE',
      maxDegrees: 90,
      minDegrees: -90,
      defaultSpeed: 40,
      portNumber: motorPortToHex.B,
      description: 'Elbow joint motor'
  },
  [MotorPorts.HEIGHT]: {
      type: 'LARGE',
      maxDegrees: 120,
      minDegrees: 0,
      defaultSpeed: 35,
      portNumber: motorPortToHex.C,
      description: 'Height adjustment motor'
  },
  [MotorPorts.GRIPPER]: {
      type: 'MEDIUM',
      maxDegrees: 45,
      minDegrees: 0,
      defaultSpeed: 25,
      portNumber: motorPortToHex.D,
      description: 'Gripper motor'
  }
};

// Sensor configurations
export const SensorConfig = {
  [SensorPorts.TOUCH]: {
      type: 'TOUCH',
      mode: 0x00,
      description: 'Touch sensor for base position calibration'
  },
  [SensorPorts.COLOR]: {
      type: 'COLOR',
      mode: 0x00,
      description: 'Color sensor (if used)'
  },
  [SensorPorts.GYRO]: {
      type: 'GYRO',
      mode: 0x00,
      description: 'Gyro sensor (if used)'
  },
  [SensorPorts.ULTRASONIC]: {
      type: 'ULTRASONIC',
      mode: 0x00,
      description: 'Ultrasonic sensor (if used)'
  }
};

/*
Physical Connection Guide for H25 Robot Arm:

MOTOR PORTS (Output):
[A] - Base Motor: Controls the rotation of the entire arm
[B] - Elbow Motor: Controls the elbow joint movement
[C] - Height Motor: Controls the vertical movement
[D] - Gripper Motor: Controls the gripper open/close

SENSOR PORTS (Input):
[1] - Touch Sensor: Used for base position calibration
[2] - Color Sensor (optional)
[3] - Gyro Sensor (optional)
[4] - Ultrasonic Sensor (optional)

Notes:
- Use LARGE motors for ports A, B, and C
- Use MEDIUM motor for port D (gripper)
- Touch sensor helps calibrate the base position
*/
```

# api/src/models/RobotState.ts

```ts
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import path from 'path';

enum NodeName {
    mainColumn = 'main_column',
    upperArm = 'upper_arm',
    wristExtension = 'wrist_extension',
    hand = 'hand',
    gripper = 'gripper'
}

export interface RobotNode {
    position: [number, number, number];
    scale: [number, number, number];
    rotation?: [number, number, number];
}

export interface RobotStateDocument {
    nodes: {
        [NodeName.mainColumn]: RobotNode;
        [NodeName.upperArm]: RobotNode;
        [NodeName.wristExtension]: RobotNode;
        [NodeName.hand]: RobotNode;
        [NodeName.gripper]: RobotNode;
    };
}

const adapter = new FileSync<{ robotState: RobotStateDocument[] }>(
    path.join(__dirname, '../data/db.json')
);
const db = low(adapter);

const testDB: any = {
    "nodes": {
      "main_column": {
        "position": [0, 1.462, 0],
        "scale": [1, 1, 1],
        "rotation": []
      },
      "upper_arm": {
        "position": [2.335, 0, 0.094],
        "scale": [0.684, 1, 1],
        "rotation": []
      },
      "wrist_extension": {
        "position": [3.231, 6.551, 0.007],
        "scale": [0.264, 0.264, 0.264],
        "rotation": []
      },
      "hand": {
        "position": [3.368, 5.728, -0.119],
        "scale": [1, 0.068, 0.327],
        "rotation": [0, 1.5708, 0]
      },
      "gripper": {
        "position": [3.33, 5.545, 0.006],
        "scale": [-0.01, -0.132, -0.325],
        "rotation": [0, 1.5708, 0]
      }
    }
  }

// Initialize db with default data if empty
db.defaults({ robotState: [] }).write();

export const RobotState = {
    findOne: async (): Promise<RobotStateDocument | null> => {
        // const state = db.get('robotState').first().value();
        const state = testDB;
        return state || null;
    },

    findOneAndUpdate: async (
        query: any,
        update: RobotStateDocument
    ): Promise<RobotStateDocument | null> => {
        db.get('robotState')
            .find(query)
            .assign(update)
            .write();
        return update;
    },

    insertMany: async (documents: RobotStateDocument[]): Promise<void> => {
        db.get('robotState')
            .push(...documents)
            .write();
    },

    find: async (): Promise<RobotStateDocument[]> => {
        return db.get('robotState').value();
    }
};
```

# api/src/seed.json

```json
[
  {
    "nodes": {
      "main_column": {
        "position": [
          0,
          1.462,
          0
        ],
        "scale": [
          1,
          1,
          1
        ]
      },
      "upper_arm": {
        "position": [
          2.335,
          0,
          0.094
        ],
        "scale": [
          0.684,
          1,
          1
        ]
      },
      "wrist_extension": {
        "position": [
          3.231,
          6.551,
          0.007
        ],
        "scale": [
          0.264,
          0.264,
          0.264
        ]
      },
      "hand": {
        "position": [
          3.368,
          5.728,
          -0.119
        ],
        "scale": [
          1,
          0.068,
          0.327
        ],
        "rotation": [0, 1.5708, 0]
      },
      "gripper": {
        "position": [
          3.33,
          5.545,
          0.006
        ],
        "scale": [
          -0.01,
          -0.132,
          -0.325
        ],
        "rotation": [0, 1.5708, 0]
      }
    }
  }
]
```

# api/src/server.ts

```ts
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import logger from './config/logger';
import stateController, { seed } from './controllers/state.controller';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// Enable CORS
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
}));

// Create Socket.IO instance
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Initialize the application
async function initializeApp() {
    try {
        await seed();
        logger.info('Seed check completed');

        // Socket.IO connection handling
        io.on('connection', (socket) => {
            logger.info(`New client connected: ${socket.id}`);

            // Debugging socket events
            // socket.onAny((event, ...args) => {
            //     logger.info(`Received event "${event}":`, args);
            // });

            socket.on('error', (error) => {
                logger.error(`Socket error for ${socket.id}:`, error);
            });

            socket.on('disconnect', (reason) => {
                logger.info(`Client ${socket.id} disconnected: ${reason}`);
            });

            stateController(socket);
        });

        const PORT = process.env.PORT || 4000;
        
        httpServer.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`WebSocket server URL: ws://localhost:${PORT}`);
            logger.info(`HTTP server URL: http://localhost:${PORT}`);
        });

    } catch (err) {
        logger.error('Server initialization error:', err);
        process.exit(1);
    }
}

// Handle process events
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', reason);
});

initializeApp();

export default app;
```

# api/tsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "target": "es6",
    "noImplicitAny": true,
    "moduleResolution": "node",
    "sourceMap": true,
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "*": [
        "node_modules/*",
        "src/types/*"
      ]
    }
  },
  "include": [
    "src/**/*"
  ]
}

```

# docker-entrypoint.sh

```sh

```

# hmi/config-overrides.js

```js
const { alias } = require('react-app-rewire-alias')

module.exports = function override (config) {
  alias({
    '@components': 'src/components',
    '@styles': 'src/styles',
    '@types': 'src/types',
    '@utils': 'src/utils'
  })(config)

  return config
}

```

# hmi/package.json

```json
{
  "name": "hmi",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@react-three/drei": "^9.97.0",
    "@react-three/fiber": "^8.15.15",
    "@types/cors": "^2.8.17",
    "cors": "^2.8.5",
    "leva": "^0.9.35",
    "lodash.clamp": "^4.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "socket.io-client": "^4.7.4",
    "stats.js": "^0.17.0",
    "three": "^0.161.0"
  },
  "devDependencies": {
    "@babel/plugin-proposal-private-property-in-object": "^7.21.11",
    "@types/lodash.clamp": "^4.0.9",
    "@types/node": "^16.18.70",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@types/three": "^0.160.0",
    "react-app-rewire-alias": "^1.1.7",
    "react-app-rewired": "^2.2.1",
    "typescript": "^4.9.5"
  },
  "scripts": {
    "start": "GENERATE_SOURCEMAP=false react-app-rewired start",
    "build": "react-app-rewired build",
    "test": "react-app-rewired test",
    "eject": "react-app-rewired eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}

```

# hmi/public/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="theme-color" content="#F84823"/>
    <meta name="description" content="Robotic Arm"/>
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json"/>
    <Style>
        html,
        body,
        #root {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
        }

        body {
            background: #303035;
        }
    </Style>
    <title>Robotic Arm</title>
</head>
<body>
<noscript>You need to enable JavaScript to run this app.</noscript>
<div id="root"></div>
</body>
</html>

```

# hmi/public/manifest.json

```json
{
  "short_name": "Robotic Arm",
  "name": "Robotic Arm Control Panel",
  "icons": [
    {
      "src": "favicon.png",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}

```

# hmi/public/robot_v2.glb

This is a binary file of the type: Binary

# hmi/public/robot.glb

This is a binary file of the type: Binary

# hmi/public/robots.txt

```txt
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

```

# hmi/README.md

```md
# Hmi

### To do
- Persist matrix data
- Inverse Kinematics
- Material UI
- Redux Tookit
- 

```

# hmi/src/App.tsx

```tsx
import React, {useState, useEffect, useCallback} from 'react';
import {Canvas} from '@react-three/fiber';
import {GizmoHelper, GizmoViewport, OrbitControls, Environment, Stats, PerspectiveCamera} from '@react-three/drei';
import {Shadows, Ground} from '@components/stage';
import socketIOClient from 'socket.io-client';
import {Robot} from '@types';
import {RobotArm} from "@components/model/RobotArm";

const SOCKET_SERVER_URL = 'http://localhost:4000';

export default function App() {
    const [robotData, setRobotData] = useState<Robot.RobotNodes>();
    const [socket, setSocket] = useState<any>(null);
    const [error, setError] = useState<string>('');

    // Initialize socket connection
    useEffect(() => {
        console.log('Initializing socket connection...');
        const newSocket = socketIOClient(SOCKET_SERVER_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
            console.log('Connected to server, socket id:', newSocket.id);
            setError('');
        });

        newSocket.on('connect_error', (error: any) => {
            console.error('Socket connection error:', error);
            setError(`Connection error: ${error.message}`);
        });

        newSocket.on('error', (error: any) => {
            console.error('Socket error:', error);
            setError(`Socket error: ${error.message}`);
        });

        setSocket(newSocket);

        return () => {
            console.log('Cleaning up socket connection...');
            newSocket.close();
        };
    }, []);

    // Handle initial state and state updates
    useEffect(() => {
        if (!socket) return;

        // Request initial state
        if (!robotData) {
            console.log('Requesting initial state...');
            socket.emit("state:get");
        }

        // Listen for state updates
        socket.on("state", (data: Robot.RobotNodes) => {
            console.log('Received state update:', data);
            setRobotData(data);
        });

        return () => {
            socket.off("state");
        };
    }, [socket, robotData]);

    const updateRobotData = useCallback((newData: Partial<Robot.RobotNodes>) => {
        if (!socket?.connected) {
            console.error('Cannot update: Socket not connected');
            return;
        }

        console.log('Updating robot data:', newData);
        setRobotData(prevData => {
            if (prevData) {
                const updatedData = {...prevData, ...newData};
                console.log('Emitting state update:', updatedData);
                socket.emit("state:update", updatedData);
                return updatedData;
            }
            return prevData;
        });
    }, [socket]);

    // Display error if any
    if (error) {
        return (
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#ff4444',
                color: 'white',
                padding: '20px',
                borderRadius: '5px',
                textAlign: 'center'
            }}>
                <div>{error}</div>
                <button 
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: '10px',
                        padding: '5px 15px',
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            {robotData && (
                <Canvas>
                    <PerspectiveCamera makeDefault fov={40} position={[10, 8, 25]}/>
                    <RobotArm data={robotData} onUpdate={updateRobotData}/>
                    <Shadows/>
                    <Ground/>
                    <Environment preset="city"/>
                    <OrbitControls makeDefault/>
                    <GizmoHelper alignment="bottom-right" margin={[100, 100]}>
                        <GizmoViewport labelColor="white" axisHeadScale={1}/>
                    </GizmoHelper>
                    <Stats/>
                </Canvas>
            )}
        </>
    );
}
```

# hmi/src/components/gizmo/context.ts

```ts
 
import {createContext} from 'react'
import {Robot} from '@types'

export const context = createContext<Robot.GizmoState>(null!)

```

# hmi/src/components/gizmo/index.tsx

```tsx
import React, {useEffect, useRef} from 'react'
import {useThree} from '@react-three/fiber'
import {Translate} from './Translate'
import {Rotate} from './Rotate'
import {context} from './context'
import {Vector3, Matrix4, Box3, Group, Euler} from 'three'
import {Robot} from '@types'

const localMatrix = new Matrix4()
const localMatrix0 = new Matrix4()
const localMatrix0Inv = new Matrix4()
const localDeltaMatrix = new Matrix4()
const worldMatrix0 = new Matrix4()
const worldMatrix = new Matrix4()
const parentMatrix = new Matrix4()
const parentMatrixInv = new Matrix4()

export const Gizmo = ({
    scale = 1,
    matrix,
    anchor,
    activeAxes = [true, true, true],
    disableTranslation = false,
    disableRotation = false,
    translationLimits,
    rotationLimits,
    userData,
    onUpdate,
    children,
}: Robot.GizmoProperties) => {
    const invalidate = useThree((state) => state.invalidate)
    const parentGroup = useRef<Group>(null!)
    const matrixGroup = useRef<Group>(null!)
    const gizmoGroup = useRef<Group>(null!)
    const childrenGroup = useRef<Group>(null!)

    useEffect(() => {
        if (anchor) {
            const targetGroup = childrenGroup.current
            const boundingBox = new Box3()

            if (targetGroup) {
                targetGroup.updateWorldMatrix(true, true)
                parentMatrixInv.copy(targetGroup.matrixWorld).invert()
                boundingBox.makeEmpty()

                targetGroup.traverse((object: any) => {
                    if (!object.geometry) return
                    if (!object.geometry.boundingBox) object.geometry.computeBoundingBox()

                    localMatrix.copy(object.matrixWorld).premultiply(parentMatrixInv)
                    const objectBoundingBox = new Box3()
                    objectBoundingBox.copy(object.geometry.boundingBox)
                    objectBoundingBox.applyMatrix4(localMatrix)
                    boundingBox.union(objectBoundingBox)
                })

                const vectorCenter = new Vector3()
                const vectorSize = new Vector3()
                const anchorOffsetVector = new Vector3()
                const positionVector = new Vector3()

                vectorCenter.copy(boundingBox.max).add(boundingBox.min).multiplyScalar(0.5)
                vectorSize.copy(boundingBox.max).sub(boundingBox.min).multiplyScalar(0.5)
                anchorOffsetVector.copy(vectorSize).multiply(new Vector3(...anchor)).add(vectorCenter)
                positionVector.set(0, 0, 0).add(anchorOffsetVector)
                gizmoGroup.current.position.copy(positionVector)

                invalidate()
            }
        }
    }, [anchor, invalidate])

    const configuration = {
        onDragStart: () => {
            console.log('Drag start');
            localMatrix0.copy(matrixGroup.current.matrix)
            worldMatrix0.copy(matrixGroup.current.matrixWorld)
            invalidate()
        },

        onDrag: (worldDeltaMatrix: Matrix4) => {
            console.log('Dragging');
            parentMatrix.copy(parentGroup.current.matrixWorld)
            parentMatrixInv.copy(parentMatrix).invert()
            worldMatrix.copy(worldMatrix0).premultiply(worldDeltaMatrix)
            localMatrix.copy(worldMatrix).premultiply(parentMatrixInv)
            localMatrix0Inv.copy(localMatrix0).invert()
            localDeltaMatrix.copy(localMatrix).multiply(localMatrix0Inv)
            matrixGroup.current.matrix.copy(localMatrix)

            // Extract rotation from matrix
            
            const rotation = new Euler().setFromRotationMatrix(localMatrix);
            const rotationArray: [number, number, number] = [rotation.x, rotation.y, rotation.z];

            console.log('Updating rotation:', rotationArray);
            if (onUpdate) {
                onUpdate(rotationArray);
            }

            invalidate()
        },

        onDragEnd: () => {
            console.log('Drag end');
            invalidate()
        },

        translationLimits,
        rotationLimits,
        scale,
        userData
    }

    return (
        <context.Provider value={configuration}>
            <group ref={parentGroup}>
                <group ref={matrixGroup} matrix={matrix} matrixAutoUpdate={false}>
                    <group ref={gizmoGroup}>
                        {!disableTranslation && (
                            <>
                                {activeAxes[0] && <Translate axis={0}/>}
                                {activeAxes[1] && <Translate axis={1}/>}
                                {activeAxes[2] && <Translate axis={2}/>}
                            </>
                        )}
                        {!disableRotation && (
                            <>
                                {activeAxes[0] && activeAxes[1] && <Rotate axis={2}/>}
                                {activeAxes[0] && activeAxes[2] && <Rotate axis={1}/>}
                                {activeAxes[2] && activeAxes[1] && <Rotate axis={0}/>}
                            </>
                        )}
                    </group>
                    <group ref={childrenGroup}>{children}</group>
                </group>
            </group>
        </context.Provider>
    )
}
```

# hmi/src/components/gizmo/Rotate.tsx

```tsx
 
import React, {useContext, useRef, useState, useCallback, useMemo, FC} from 'react'
import {ThreeEvent, useThree} from '@react-three/fiber'
import {Line, Html} from '@react-three/drei'
import clamp from 'lodash.clamp'
import {context} from './context'
import {Vector3, Matrix4, Ray, Group, Plane} from 'three'
import {calculateAngle, toDegrees, toRadians, minimizeAngle} from '@utils'

/**
 * Rotate lets the user drag the gizmo and, with it, the child objects over the configured rotation axis/axes
 */
export const Rotate: FC<{ axis: 0 | 1 | 2 }> = ({axis}) => {

    // get the gizmo config & event implementations from context
    const {
        rotationLimits,
        scale,
        onDragStart,
        onDrag,
        onDragEnd,
        userData
    } = useContext(context)

    // determine directions
    const direction1 =
        axis === 2 ? new Vector3(1, 0, 0) :
            axis === 1 ? new Vector3(0, 0, 1) : new Vector3(0, 1, 0)
    const direction2 =
        axis === 2 ? new Vector3(0, 1, 0) :
            axis === 1 ? new Vector3(1, 0, 0) : new Vector3(0, 0, 1)

    // get a handle on the cam controls to enable/disable while operating the gizmo
    const camControls = useThree((state) => state.controls) as unknown as { enabled: boolean }

    // the label showing the rotated value
    const rotationLabel = useRef<HTMLDivElement>(null!)

    // Object3D group for this Gizmo
    const gizmoGroup = useRef<Group>(null!)

    // ref to keep info where the mouse/pointer click occurred
    const clickInfo = useRef<{
        clickPoint: Vector3
        origin: Vector3
        e1: Vector3
        e2: Vector3
        normal: Vector3
        plane: Plane
    } | null>(null)

    // is the mouse hovering over the gizmo. we change the color when hovering over
    const [isHovered, setIsHovered] = useState(false)

    // the angle calculated on start and used while moving
    const angle0 = useRef<number>(0)
    const angle = useRef<number>(0)

    /**
     * On pointer down (click) we prepare to start dragging
     */
    const onPointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {

        // update label with rotation value
        rotationLabel.current.innerText = `${toDegrees(angle.current).toFixed(0)}°`
        rotationLabel.current.style.display = 'block'

        // avoid handlers firing
        event.stopPropagation()

        // get the xyz vector for the mouse click
        const clickPoint = event.point.clone()

        // @todo learn what is going on here
        const origin = new Vector3().setFromMatrixPosition(gizmoGroup.current.matrixWorld)
        const e1 = new Vector3().setFromMatrixColumn(gizmoGroup.current.matrixWorld, 0).normalize()
        const e2 = new Vector3().setFromMatrixColumn(gizmoGroup.current.matrixWorld, 1).normalize()
        const normal = new Vector3().setFromMatrixColumn(gizmoGroup.current.matrixWorld, 2).normalize()
        const plane = new Plane().setFromNormalAndCoplanarPoint(normal, origin)

        // set the click info
        clickInfo.current = {clickPoint, origin, e1, e2, normal, plane}

        // invoke drag start for rotation operation
        onDragStart({action: 'Rotate', axis, origin, directions: [e1, e2, normal]})

        // disable the cam controls to avoid it fighting with the gizmo movements
        camControls && (camControls.enabled = false)

        // @ts-ignore - setPointerCapture is not in the type definition
        event.target.setPointerCapture(event.pointerId)

    }, [camControls, onDragStart, axis])

    /**
     * Mouse/pointer moving
     */
    const onPointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {

        // avoid handlers firing
        event.stopPropagation()

        if (!isHovered) setIsHovered(true)

        if (clickInfo.current) {

            const {clickPoint, origin, e1, e2, normal, plane} = clickInfo.current

            /**
             * Check if we are still within translation limits
             */
            const [min, max] = rotationLimits?.[axis] || [undefined, undefined]
            const ray = new Ray()
            const intersection = new Vector3()

            ray.copy(event.ray)
            ray.intersectPlane(plane, intersection)
            ray.direction.negate()
            ray.intersectPlane(plane, intersection)

            let deltaAngle = calculateAngle(clickPoint, intersection, origin, e1, e2)
            let degrees = toDegrees(deltaAngle)

            if (event.shiftKey) {
                degrees = Math.round(degrees / 10) * 10
                deltaAngle = toRadians(degrees)
            }

            if (min !== undefined && max !== undefined && max - min < 2 * Math.PI) {
                deltaAngle = minimizeAngle(deltaAngle)
                deltaAngle = deltaAngle > Math.PI ? deltaAngle - 2 * Math.PI : deltaAngle
                deltaAngle = clamp(deltaAngle, min - angle0.current, max - angle0.current)
                angle.current = angle0.current + deltaAngle
            } else {
                angle.current = minimizeAngle(angle0.current + deltaAngle)
                angle.current = angle.current > Math.PI ? angle.current - 2 * Math.PI : angle.current
            }

            // update label values
            degrees = toDegrees(angle.current)
            rotationLabel.current.innerText = `${degrees.toFixed(0)}°`

            const rotationMatrix = new Matrix4()
            const posNew = new Vector3()

            rotationMatrix.makeRotationAxis(normal, deltaAngle)
            posNew.copy(origin).applyMatrix4(rotationMatrix).sub(origin).negate()
            rotationMatrix.setPosition(posNew)

            // invoke the onDrag method with the calculated rotation matrix
            onDrag(rotationMatrix)
        }

    }, [onDrag, isHovered, rotationLimits, axis])

    /**
     * Pointer up ends the gizmo interaction
     */
    const onPointerUp = useCallback((event: ThreeEvent<PointerEvent>) => {

        // hide label
        rotationLabel.current.style.display = 'none'

        // avoid handlers firing
        event.stopPropagation()

        angle0.current = angle.current

        // reset click info
        clickInfo.current = null

        // call the onDragEnd
        onDragEnd()

        // give cam controls back
        camControls && (camControls.enabled = true)

        // @ts-ignore - releasePointerCapture & PointerEvent#pointerId is not in the type definition
        event.target.releasePointerCapture(event.pointerId)

    }, [camControls, onDragEnd])

    /**
     * In the pointer out we mark hovered as false
     */
    const onPointerOut = useCallback((event: ThreeEvent<PointerEvent>) => {
        // avoid handlers firing
        event.stopPropagation()
        setIsHovered(false)
    }, [])


    /**
     * Gizmo group matrix
     */
    const matrix = useMemo(() => {
        const dir1N = direction1.clone().normalize()
        const dir2N = direction2.clone().normalize()
        return new Matrix4().makeBasis(dir1N, dir2N, dir1N.clone().cross(dir2N))
    }, [direction1, direction2])

    const r = scale * 0.65

    /**
     * Calculate gizmo arc shape
     */
    const arc = useMemo(() => {
        const segments = 32
        const points: Vector3[] = []
        for (let j = 0; j <= segments; j++) {
            const angle = (j * (Math.PI / 2)) / segments
            points.push(new Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0))
        }
        return points
    }, [r])

    // colors of the axes and a hover color
    const axisColors = ['#ff2060', '#20df80', '#2080ff']
    const color = isHovered ? '#ffff40' : axisColors[axis]

    return (
        <group ref={gizmoGroup}
               onPointerDown={onPointerDown}
               onPointerMove={onPointerMove}
               onPointerUp={onPointerUp}
               onPointerOut={onPointerOut}
               matrix={matrix}
               matrixAutoUpdate={false}>

            {/** the label showing the rotation value */}
            <Html position={[r, r, 0]}>
                <div
                    style={{
                        display: 'none',
                        fontFamily: 'monospace',
                        background: '#F84823',
                        color: 'white',
                        padding: '6px 8px',
                        borderRadius: 7,
                        whiteSpace: 'nowrap'
                    }}
                    ref={rotationLabel}
                />
            </Html>

            {/* The invisible mesh being raycast */}
            <Line points={arc} lineWidth={8} visible={false} userData={userData}/>

            {/* The visible mesh */}
            <Line
                transparent
                raycast={() => null}
                points={arc}
                lineWidth={2}
                color={color}
                polygonOffset
                polygonOffsetFactor={-10}
            />

        </group>
    )
}

```

# hmi/src/components/gizmo/Translate.tsx

```tsx
 
import React, {useContext, useCallback, useMemo, useRef, useState, FC} from 'react'
import {ThreeEvent, useThree} from '@react-three/fiber'
import {Line, Html} from '@react-three/drei'
import {context} from './context'
import {Vector3, Matrix4, Group, Quaternion} from 'three'
import {calculateOffset} from '@utils'

/**
 * Translate lets the user drag the gizmo and, with it, the child objects over the configured translation axis/axes
 */
export const Translate: FC<{ axis: 0 | 1 | 2 }> = ({axis}) => {

    // get the gizmo config & event implementations from context
    const {
        translationLimits,
        scale,
        onDragStart,
        onDrag,
        onDragEnd,
        userData
    } = useContext(context)

    // determine direction.
    const direction =
        axis === 0 ? new Vector3(1, 0, 0) :
            axis === 1 ? new Vector3(0, 1, 0) : new Vector3(0, 0, 1)

    // get a handle on the cam controls to enable/disable while operating the gizmo
    const camControls = useThree((state) => state.controls) as unknown as { enabled: boolean }

    // the label showing the translated value
    const translationLabel = useRef<HTMLDivElement>(null!)

    // Object3D group for this Gizmo
    const gizmoGroup = useRef<Group>(null!)

    // ref to keep info where the mouse/pointer click occurred
    const clickInfo = useRef<{ clickPoint: Vector3; dir: Vector3 } | null>(null)

    // the offset calculated on start and used while moving
    const offset0 = useRef<number>(0)

    // is the mouse hovering over the gizmo. we change the color when hovering over
    const [isHovered, setIsHovered] = useState(false)

    const translation = useRef<[number, number, number]>([0, 0, 0])

    /**
     * On pointer down (click) we prepare to start dragging
     */
    const onPointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {

            // update label with current translation value for this axis and show it
            translationLabel.current.innerText = `${translation.current[axis].toFixed(2)}`
            translationLabel.current.style.display = 'block'

            // stopPropagation will stop underlying handlers from firing
            event.stopPropagation()

            // get the xyz vector for the mouse click
            const clickPoint = event.point.clone()

            // @todo learn what is going on here
            const rotation = new Matrix4().extractRotation(gizmoGroup.current.matrixWorld)
            const origin = new Vector3().setFromMatrixPosition(gizmoGroup.current.matrixWorld)
            const dir = direction.clone().applyMatrix4(rotation).normalize()

            // set the click info
            clickInfo.current = {clickPoint, dir}
            offset0.current = translation.current[axis]

            // invoke drag start for translation operation
            onDragStart({action: 'Translate', axis, origin, directions: [dir]})

            // disable the cam controls to avoid it fighting with the gizmo movements
            camControls && (camControls.enabled = false)

            // @ts-ignore - setPointerCapture is not in the type definition
            event.target.setPointerCapture(event.pointerId)

        }, [direction, camControls, onDragStart, translation, axis]
    )

    /**
     * Mouse/pointer moving
     */
    const onPointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {

            // stopPropagation will stop underlying handlers from firing
            event.stopPropagation()

            if (!isHovered) setIsHovered(true)

            if (clickInfo.current) {

                const {clickPoint, dir} = clickInfo.current

                /**
                 * Check if we are still within translation limits
                 */
                const [min, max] = translationLimits?.[axis] || [undefined, undefined]
                let offset = calculateOffset(clickPoint, dir, event.ray.origin, event.ray.direction)
                if (min !== undefined) offset = Math.max(offset, min - offset0.current)
                if (max !== undefined) offset = Math.min(offset, max - offset0.current)

                // set the current translation
                translation.current[axis] = offset0.current + offset

                // update label with translation value
                translationLabel.current.innerText = `${translation.current[axis].toFixed(2)}`

                // create and calculate the offset matrix for the on drag method
                const offsetMatrix = new Matrix4().makeTranslation(dir.x * offset, dir.y * offset, dir.z * offset)

                // invoke the onDrag method with the calculated offset matrix
                onDrag(offsetMatrix)
            }

        }, [onDrag, isHovered, translation, translationLimits, axis]
    )

    /**
     * Pointer up ends the gizmo interaction
     */
    const onPointerUp = useCallback((event: ThreeEvent<PointerEvent>) => {

            // hide label
            translationLabel.current.style.display = 'none'

            // avoid handlers firing
            event.stopPropagation()

            // reset click info
            clickInfo.current = null

            // call the onDragEnd
            onDragEnd()

            // give cam controls back
            camControls && (camControls.enabled = true)

            // @ts-ignore - releasePointerCapture & PointerEvent#pointerId is not in the type definition
            event.target.releasePointerCapture(event.pointerId)

        }, [camControls, onDragEnd]
    )

    /**
     * In the pointer out we mark hovered as false
     */
    const onPointerOut = useCallback((event: ThreeEvent<PointerEvent>) => {
        // avoid handlers firing
        event.stopPropagation()
        setIsHovered(false)
    }, [])

    // calculate properties for the translation arrow meshes
    const {cylinderLength, coneWidth, coneLength, matrix} = useMemo(() => {
        const coneWidth = scale / 20
        const coneLength = scale / 5
        const cylinderLength = scale - coneLength
        const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize())
        const matrixL = new Matrix4().makeRotationFromQuaternion(quaternion)
        return {cylinderLength, coneWidth, coneLength, matrix: matrixL}
    }, [direction, scale])

    // colors of the axes and a hover color
    const axisColors = ['#ff2060', '#20df80', '#2080ff']
    const color = isHovered ? '#ffff40' : axisColors[axis]

    return (
        <group ref={gizmoGroup}>

            {/** group on which we set the gizmo event implementations */}
            <group
                matrix={matrix}
                matrixAutoUpdate={false}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerOut={onPointerOut}>

                {/** the label showing the translation value */}
                <Html position={[0, -coneLength, 0]}>
                    <div
                        style={{
                            display: 'none',
                            fontFamily: 'monospace',
                            background: '#F84823',
                            color: 'white',
                            padding: '6px 8px',
                            borderRadius: 7,
                            whiteSpace: 'nowrap'
                        }}
                        ref={translationLabel}
                    />
                </Html>

                {/* The invisible mesh being raycast
                    @todo learn how this works
                 */}
                <mesh visible={false} position={[0, (cylinderLength + coneLength) / 2.0, 0]} userData={userData}>
                    <cylinderGeometry args={[coneWidth * 1.4, coneWidth * 1.4, cylinderLength + coneLength, 8, 1]}/>
                </mesh>

                {/* The visible mesh */}
                <Line transparent
                      raycast={() => null}
                      points={[0, 0, 0, 0, cylinderLength, 0]}
                      lineWidth={2}
                      color={color}
                      polygonOffset
                      renderOrder={1}
                      polygonOffsetFactor={-10}/>
                <mesh raycast={() => null} position={[0, cylinderLength + coneLength / 2.0, 0]} renderOrder={500}>
                    <coneGeometry args={[coneWidth, coneLength, 24, 1]}/>
                    <meshBasicMaterial transparent={true} color={color}/>
                </mesh>

            </group>
        </group>
    )
}

```

# hmi/src/components/mesh/Mesh.tsx

```tsx
 
import React from 'react'
import {Robot} from '@types'
import { Euler } from 'three'

/**
 * Defines a Mesh with material and location
 *
 * @param node The GLTF Mesh
 * @param data The node 3d data
 */


const Mesh = ({node, data}: Robot.MeshProperties) => {
    //   @ts-ignore
    const rotation = data.rotation.length > 0 ? new Euler().fromArray(data.rotation) : new Euler(0, 0, 0)

    return (
        <mesh geometry={node.geometry}
              material={node.material}
              position={data.position}
              rotation={rotation}
              scale={data.scale}
        />
    )
}

export default Mesh

```

# hmi/src/components/model/index.ts

```ts
 

/**
 * The model folder contains the models we want to render.
 * Model is created in Blender, exported to glb and converted to tsx.
 *
 * Using a Barrel for clean import
 */
export {RobotArm} from './RobotArm'

```

# hmi/src/components/model/RobotArm.tsx

```tsx
import {Gizmo} from '@components/gizmo'
import {useGLTF} from '@react-three/drei'
import {Robot} from '@types'
import Mesh from "@components/mesh/Mesh"

interface RobotProps {
    data: Robot.RobotNodes;
    onUpdate: (newData: Partial<Robot.RobotNodes>) => void;
}

export const RobotArm = ({data, onUpdate}: RobotProps) => {
    const {nodes} = useGLTF('/robot.glb') as unknown as Robot.DreiGLTF;
    const node = Robot.NodeName;

    const handleGizmoUpdate = (nodeName: Robot.NodeName, newMatrix: [number, number, number]) => {
        console.log(`Updating ${nodeName}:`, newMatrix);
        
        const newData: Partial<Robot.RobotNodes> = {
            nodes: {
                ...data.nodes,
                [nodeName]: {
                    ...data.nodes[nodeName],
                    position: data.nodes[nodeName].position,
                    scale: data.nodes[nodeName].scale,
                    rotation: data.nodes[nodeName].rotation,
                    // Note: problem with rotation hand and gripper
                    // when use newMatrix
                    // rotation: newMatrix
                }
            }
        };

        // Preserve initial rotations for hand and gripper
        if (newData.nodes) {
            if (newData.nodes.hand) {
                newData.nodes.hand.rotation = data.nodes.hand.rotation;
            }
            if (newData.nodes.gripper) {
                newData.nodes.gripper.rotation = data.nodes.gripper.rotation;
            }
        }

        console.log('Sending update:', newData);
        onUpdate(newData);
    };

    return (
        <group>
            <Gizmo scale={5}
                   disableTranslation
                   activeAxes={[true, false, true]}
                   userData={[node.mainColumn]}
                   onUpdate={(newMatrix) => handleGizmoUpdate(node.mainColumn, newMatrix)}>
                <Mesh node={nodes[node.mainColumn]} data={data.nodes[node.mainColumn]}/>

                <Gizmo activeAxes={[false, true, false]}
                       translationLimits={[undefined, [-1, .8], undefined]}
                       disableRotation
                       anchor={[-0.8, 1.5, 0]}
                       scale={1}
                       userData={[node.upperArm]}
                       onUpdate={(newMatrix) => handleGizmoUpdate(node.upperArm, newMatrix)}>

                    <Mesh node={nodes[node.upperArm]} data={data.nodes[node.upperArm]}/>
                    <Mesh node={nodes[node.wristExtension]} data={data.nodes[node.wristExtension]}/>
                    <Mesh node={nodes[node.hand]} data={data.nodes[node.hand]}/>

                    <Gizmo activeAxes={[false, false, true]}
                           translationLimits={[undefined, undefined, [0, 0.4]]}
                           anchor={[2, 0, 2]}
                           scale={0.75}
                           userData={[node.gripper]}
                           onUpdate={(newMatrix) => handleGizmoUpdate(node.gripper, newMatrix)}>
                        <Mesh node={nodes[node.gripper]} data={data.nodes[node.gripper]}/>
                    </Gizmo>
                </Gizmo>
            </Gizmo>
        </group>
    );
};

useGLTF.preload('/robot.glb');
```

# hmi/src/components/stage/Ground.tsx

```tsx
 
import React from 'react'
import {Grid} from '@react-three/drei'

/**
 * A drei Grid providing a plane for the model to be presented on
 *
 * @todo move properties to user/app configuration
 */
export const Ground = () => {

    return <Grid position={[0, -0.01, 0]}
                 args={[10.5, 10.5]}
                 cellSize={0.5}
                 cellThickness={0.5}
                 cellColor={'#6f6f6f'}
                 sectionSize={3}
                 sectionThickness={1}
                 sectionColor={'#9d4b4b'}
                 fadeDistance={30}
                 fadeStrength={1}
                 followCamera={false}
                 infiniteGrid={true}/>
}

```

# hmi/src/components/stage/index.ts

```ts
 

/**
 * The stage folder contains the 'stage' Components,
 * visual elements that define the environment our models
 * appear in such as Lights, floors, shadows, ambient lights
 *
 * Using a Barrel for clean import
 */
export {Shadows} from './Shadows'
export {Ground} from './Ground'

```

# hmi/src/components/stage/Shadows.tsx

```tsx
 
import React, {memo} from 'react'
import {AccumulativeShadows, RandomizedLight} from '@react-three/drei'

/**
 * Providing natural looking shadow/light
 */
export const Shadows = memo(() => (
    <AccumulativeShadows temporal frames={100} color="#9d4b4b" colorBlend={0.5} alphaTest={0.9} scale={20}>
        <RandomizedLight amount={8} radius={4} position={[5, 5, -10]}/>
    </AccumulativeShadows>
))

```

# hmi/src/index.tsx

```tsx
 
import React from 'react'
import App from './App'
import ReactDOM from 'react-dom/client'

// Render the App on the root div
const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
)

root.render(<App/>)

```

# hmi/src/types/index.ts

```ts
 
import {ReactNode} from 'react'
import {GLTF} from 'three/examples/jsm/loaders/GLTFLoader'
import {Vector3, Mesh, MeshStandardMaterial, Matrix4} from 'three'

/**
 * Types for the project
 */
export namespace Robot {

    /**
     * The Node names we expect on a Robot
     */
    export enum NodeName {
        mainColumn = 'main_column',
        upperArm = 'upper_arm',
        wristExtension = 'wrist_extension',
        hand = 'hand',
        gripper = 'gripper'
    }

    /**
     * Nodes expected in robot data
     */
    export interface RobotNodes {
        nodes: {
            [NodeName.mainColumn]: RobotNode,
            [NodeName.upperArm]: RobotNode,
            [NodeName.wristExtension]: RobotNode,
            [NodeName.hand]: RobotNode,
            [NodeName.gripper]: RobotNode
        }
    }

    /**
     * Robot Node data
     */
    export interface RobotNode {
        position: Vector3,
        scale: Vector3
        rotation?: Vector3
    }

    /**
     * Since useGLTF does not supply the nodes and materials types we define them ourselves.
     * Seems like missing typing in drei.
     */
    export type DreiGLTF = GLTF & {
        nodes: Record<string, Mesh>
        materials: Record<string, MeshStandardMaterial>
    }

    /**
     * With mesh and robot data we construct each Robot node
     */
    export type MeshProperties = {
        node: Mesh
        data: RobotNode
    }

    /**
     * Properties we receive for a Robot Gizmo
     */
    export type GizmoProperties = {

        // gizmo scale
        scale?: number

        // start matrix
        matrix?: Matrix4

        // gizmo anchor
        anchor?: [number, number, number]

        // axis to operate on
        activeAxes?: [boolean, boolean, boolean]

        // switch off all rotation or translation
        disableTranslation?: boolean
        disableRotation?: boolean

        // translation limits array: x:[start,end] y[start,end] z[start,end]
        translationLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined]

        // rotation limits array: x:[start,end] y[start,end] z[start,end]
        rotationLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined]

        // custom data
        userData?: { [key: string]: any }
        
        children?: ReactNode

        onUpdate: (matrix: [number, number, number]) => void

    }

    /**
     * The state we hold for a Gizmo
     */
    export type GizmoState = {
        onDragStart: (props: GizmoStart) => void
        onDrag: (local: Matrix4) => void
        onDragEnd: () => void
        translationLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined]
        rotationLimits?: [[number, number] | undefined, [number, number] | undefined, [number, number] | undefined]
        scale: number
        userData?: { [key: string]: any }
    }

    /**
     * The start event when Gizmo is invoked
     */
    export type GizmoStart = {
        action: 'Translate' | 'Rotate'
        axis: 0 | 1 | 2
        origin: Vector3
        directions: Vector3[]
    }
}

```

# hmi/src/utils/index.ts

```ts
 
import {Vector3} from "three";

/**
 * Calculate degrees from radians
 * @param radians
 */
const toDegrees = (radians: number) => (radians * 180) / Math.PI

/**
 * Calculate radians from degrees
 * @param degrees
 */
const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/**
 *
 * @param clickPoint
 * @param intersectionPoint
 * @param origin
 * @param e1
 * @param e2
 */
const calculateAngle = (clickPoint: Vector3, intersectionPoint: Vector3, origin: Vector3, e1: Vector3, e2: Vector3) => {

    const clickDir = new Vector3()
    const intersectionDir = new Vector3()

    clickDir.copy(clickPoint).sub(origin)
    intersectionDir.copy(intersectionPoint).sub(origin)

    const dote1e1 = e1.dot(e1)
    const dote2e2 = e2.dot(e2)
    const uClick = clickDir.dot(e1) / dote1e1
    const vClick = clickDir.dot(e2) / dote2e2
    const uIntersection = intersectionDir.dot(e1) / dote1e1
    const vIntersection = intersectionDir.dot(e2) / dote2e2
    const angleClick = Math.atan2(vClick, uClick)
    const angleIntersection = Math.atan2(vIntersection, uIntersection)

    return angleIntersection - angleClick
}

/**
 *
 * @param num
 * @param denom
 */
const fmod = (num: number, denom: number) => {

    let k = Math.floor(num / denom)
    k = k < 0 ? k + 1 : k

    return num - k * denom
}

/**
 *
 * @param angle
 */
const minimizeAngle = (angle: number) => {

    let result = fmod(angle, 2 * Math.PI)

    if (Math.abs(result) < 1e-6) {
        return 0.0
    }

    if (result < 0.0) {
        result += 2 * Math.PI
    }

    return result
}

/**
 * Helper method to calculate the offset when determining
 * if we are still within translation limits
 * @todo move to utils
 */
const calculateOffset = (clickPoint: Vector3, normal: Vector3, rayStart: Vector3, rayDir: Vector3) => {

    const vec1 = new Vector3()
    const vec2 = new Vector3()
    const e1 = normal.dot(normal)
    const e2 = normal.dot(clickPoint) - normal.dot(rayStart)
    const e3 = normal.dot(rayDir)

    if (e3 === 0) return -e2 / e1

    vec1.copy(rayDir).multiplyScalar(e1 / e3).sub(normal)
    vec2.copy(rayDir).multiplyScalar(e2 / e3).add(rayStart).sub(clickPoint)

    return -vec1.dot(vec2) / vec1.dot(vec1)
}

export {
    toDegrees,
    toRadians,
    calculateAngle,
    fmod,
    minimizeAngle,
    calculateOffset
}

```

# hmi/tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": [
        "src/components/*"
      ],
      "@styles": [
        "src/styles"
      ],
      "@types": [
        "src/types"
      ],
      "@utils": [
        "src/utils"
      ]
    },
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}

```

# model/crane copy.blend

This is a binary file of the type: Binary

# model/crane_lego.blend

This is a binary file of the type: Binary

# model/crane.blend

This is a binary file of the type: Binary

# model/crane.blend1

This is a binary file of the type: Binary

# model/crane.glb

This is a binary file of the type: Binary

# model/Crane.jsx

```jsx
/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 ./hmi/public/robot_v2.glb 
*/

import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/robot_v2.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.main_column.geometry} material={nodes.main_column.material} position={[0, 1.462, 0]} />
      <mesh geometry={nodes.upper_arm.geometry} material={nodes.upper_arm.material} position={[2.335, 0, 0.094]} scale={[0.684, 1, 1]} />
      <mesh geometry={nodes.wrist_extension.geometry} material={nodes.wrist_extension.material} position={[3.241, 6.541, 0.007]} scale={0.264} />
      <mesh geometry={nodes.hand.geometry} material={nodes.hand.material} position={[3.318, 5.71, -0.101]} rotation={[0, Math.PI / 2, 0]} scale={[1, 0.068, 0.327]} />
      <mesh geometry={nodes.gripper.geometry} material={nodes.gripper.material} position={[3.275, 5.505, 0.286]} rotation={[Math.PI, -Math.PI / 2, 0]} scale={[-0.01, -0.132, -0.325]} />
    </group>
  )
}

useGLTF.preload('/robot_v2.glb')

```

# model/README.md

```md
# Model

## Process

### Create Model in Blender

When modeling, mind the origins of the meshes.

- Create 1 mesh for those elements that need a gizmo for translating / rotating
- 

of what you want to : move object when replacing origin, only scale and move in edit mode to preserve origin and prevent needing scaling data

### Export to glb/glTF

Blender has an option to export your mesh to glb/glTF

### Convert to JSX

Use [GLB to JSX Converter](https://github.com/pmndrs/gltfjsx) to convert the glb/glTF file from blender 
to a ready to use jsx file.

\`\`\`shell
  npx gltfjsx Model.glb
\`\`\`

```

# model/robot_v2.glb

This is a binary file of the type: Binary

# README.md

```md
# Robotic Arm

## Intro

* api - A NodeJS project using MongoDB and Websocket connectivity for robot data
* model - The Mesh of the arm modelled in Blender
* hmi - A React Application using React Three Fiber and the API over Websockets for the telemetry data.

## Running the project

* Make sure Docker is installed running: [https://www.docker.com/get-started/](https://www.docker.com/get-started/)
* Clone the repo and run docker

\`\`\`shell
git clone https://github.com/appeltje-c/robot-arm
cd robot-arm
docker compose up -d
\`\`\`

When the project is running, you can open [http://localhost:3000](http://localhost:3000)

To stop the containers

\`\`\`shell
docker compose down
\`\`\`

## What's in the box

There are three main projects

[Hmi](hmi/README.md) : The React App

[API](./api/README.md) : The API

[Model](./model/README.md) : The Arm Model


```

# Robot_v2.jsx

```jsx
/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 ./hmi/public/robot_v2.glb 
*/

import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/robot_v2.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.main_column.geometry} material={nodes.main_column.material} position={[0, 1.462, 0]} />
      <mesh geometry={nodes.upper_arm.geometry} material={nodes.upper_arm.material} position={[2.335, 0, 0.094]} scale={[0.684, 1, 1]} />
      <mesh geometry={nodes.wrist_extension.geometry} material={nodes.wrist_extension.material} position={[3.241, 6.541, 0.007]} scale={0.264} />
      <mesh geometry={nodes.hand.geometry} material={nodes.hand.material} position={[3.318, 5.71, -0.101]} rotation={[0, Math.PI / 2, 0]} scale={[1, 0.068, 0.327]} />
      <mesh geometry={nodes.gripper.geometry} material={nodes.gripper.material} position={[3.275, 5.505, 0.286]} rotation={[Math.PI, -Math.PI / 2, 0]} scale={[-0.01, -0.132, -0.325]} />
    </group>
  )
}

useGLTF.preload('/robot_v2.glb')

```

# Robot.jsx

```jsx
/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 ./hmi/public/robot.glb 
*/

import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Model(props) {
  const { nodes, materials } = useGLTF('/robot.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.main_column.geometry} material={nodes.main_column.material} position={[0, 1.462, 0]} />
      <mesh geometry={nodes.upper_arm.geometry} material={nodes.upper_arm.material} position={[2.335, 0, 0.094]} scale={[0.684, 1, 1]} />
      <mesh geometry={nodes.wrist_extension.geometry} material={nodes.wrist_extension.material} position={[3.241, 6.541, 0.007]} scale={0.264} />
      <mesh geometry={nodes.hand.geometry} material={nodes.hand.material} position={[3.918, 5.71, 0.049]} scale={[1, 0.068, 0.327]} />
      <mesh geometry={nodes.gripper.geometry} material={nodes.gripper.material} position={[4.355, 5.515, 0.006]} rotation={[-Math.PI, 0, 0]} scale={[-0.01, -0.132, -0.325]} />
    </group>
  )
}

useGLTF.preload('/robot.glb')

```

