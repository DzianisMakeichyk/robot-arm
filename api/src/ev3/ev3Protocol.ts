import { Buffer } from 'buffer';

export enum CommandType {
    DirectCommand = 0x00,
    DirectCommandNoReply = 0x80
}

export enum OperationType {
    OutputPower = 0xA4,
    OutputStart = 0xA6,
    OutputStop = 0xA3,
    OutputReset = 0xA2,
    OutputPosition = 0xAB,
    OutputGetCount = 0xB3
}

export class EV3Protocol {
    static createDirectCommand(opcode: number, globalVars: number, localVars: number): Buffer {
        return Buffer.from([
            CommandType.DirectCommand,
            (localVars & 0xFF),
            ((localVars >> 8) & 0xFF),
            (globalVars & 0xFF),
            ((globalVars >> 8) & 0xFF),
        ]);
    }

    static createMotorCommand(port: number, power: number, angle: number): Buffer {
        const command = Buffer.alloc(15);
        
        // Header
        command[0] = CommandType.DirectCommand;
        command[1] = 0x00;  // Local vars
        command[2] = 0x00;  // Global vars
        
        // Set power
        command[3] = OperationType.OutputPower;
        command[4] = 0x00;  // Layer
        command[5] = port;  // Port
        command[6] = power; // Power
        
        // Set position
        command[7] = OperationType.OutputPosition;
        command[8] = 0x00;  // Layer
        command[9] = port;  // Port
        command[10] = angle & 0xFF;          // Position LSB
        command[11] = (angle >> 8) & 0xFF;   // Position MSB
        command[12] = (angle >> 16) & 0xFF;  // Position HSB
        
        // Start motor
        command[13] = OperationType.OutputStart;
        command[14] = port;  // Port mask

        return command;
    }

    static createStopCommand(port: number): Buffer {
        const command = Buffer.alloc(4);
        
        command[0] = CommandType.DirectCommand;
        command[1] = 0x00;
        command[2] = OperationType.OutputStop;
        command[3] = port;
        
        return command;
    }

    static createResetCommand(port: number): Buffer {
        const command = Buffer.alloc(4);
        
        command[0] = CommandType.DirectCommand;
        command[1] = 0x00;
        command[2] = OperationType.OutputReset;
        command[3] = port;
        
        return command;
    }
}