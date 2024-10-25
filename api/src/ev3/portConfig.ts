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