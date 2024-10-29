import logger from '../config/logger';

export class EV3Protocol {
    // Constants for command types
    static readonly DIRECT_COMMAND_REPLY = 0x00;
    static readonly DIRECT_COMMAND_NO_REPLY = 0x80;

    // Constants for command sizes
    static readonly LC0 = 0x00;         // Local variables count
    static readonly GC0 = 0x00;         // Global variables count

    // Operation codes
    static readonly opOUTPUT_STEP_POWER = 0xAC;
    static readonly opOUTPUT_START = 0xA6;
    static readonly opOUTPUT_STOP = 0xA3;
    static readonly opOUTPUT_POWER = 0xA4;

    // Port mappings
    static readonly PORT_A = 0x01;
    static readonly PORT_B = 0x02;
    static readonly PORT_C = 0x04;
    static readonly PORT_D = 0x08;

    static createTestToneCommand(): Buffer {
        // Command to play a simple tone - this should be noticeable on the EV3
        const command = Buffer.alloc(9);
        command[0] = 0x80;    // Direct command, no reply
        command[1] = 0x00;    // No local vars
        command[2] = 0x00;    // No global vars
        command[3] = 0x94;    // opSOUND - TONE
        command[4] = 0x01;    // Volume (0-100)
        command[5] = 0xC8;    // Frequency LSB (1000 Hz)
        command[6] = 0x03;    // Frequency MSB
        command[7] = 0x68;    // Duration LSB (1000 ms)
        command[8] = 0x03;    // Duration MSB

        logger.debug('Created test tone command:', {
            command: command.toString('hex'),
            bytes: Array.from(command)
        });

        return command;
    }

    static readonly SystemCommand = 0x01;
    static readonly ReplyCommand = 0x02;
    static readonly DirectCommand = 0x00;

    // Command types with reply
    static readonly DirectReply = 0x00;
    static readonly SystemReply = 0x03;
    static readonly DirectReplyError = 0x04;

    static createGetVersionCommand(): Buffer {
        // Simple system command to get firmware version
        const command = Buffer.from([
            this.SystemCommand,  // System command
            0x01,               // Get Version command
            0x00,               // Response expected
            0x00,               // Local vars
            0x00                // Global vars
        ]);

        logger.debug('Created version command:', {
            command: command.toString('hex'),
            bytes: Array.from(command)
        });

        return command;
    }

    static createPingCommand(): Buffer {
        // Direct command with reply
        const command = Buffer.from([
            this.DirectCommand,  // Direct command with reply
            0x00,               // Response expected
            0x00,               // Local vars
            0x00,               // Global vars
            0x01                // Ping opcode
        ]);

        logger.debug('Created ping command:', {
            command: command.toString('hex'),
            bytes: Array.from(command)
        });

        return command;
    }

    static createMotorCommand(port: number, power: number, degrees: number): Buffer {
        // Convert port number (0-3) to port bit mask (1,2,4,8)
        const portBitMask = 1 << port;
        
        // Command sequence for motor movement
        const command = Buffer.alloc(12);
        let offset = 0;

        // Header
        command[offset++] = this.DIRECT_COMMAND_NO_REPLY;  // Direct command, no reply
        command[offset++] = this.LC0;                      // 0 bytes for local vars
        command[offset++] = this.GC0;                      // 0 bytes for global vars

        // Set power level
        command[offset++] = this.opOUTPUT_POWER;
        command[offset++] = portBitMask;                   // Ports
        command[offset++] = power;                         // Power level (-100 to 100)

        // Move to position
        command[offset++] = this.opOUTPUT_STEP_POWER;
        command[offset++] = portBitMask;                   // Ports
        command[offset++] = power;                         // Power
        
        // Position (degrees)
        const pos = Math.floor(degrees);
        command[offset++] = pos & 0xFF;                    // Position LSB
        command[offset++] = (pos >> 8) & 0xFF;            // Position MSB

        // Start motor
        command[offset++] = this.opOUTPUT_START;

        logger.debug('Created motor command:', {
            command: command.toString('hex'),
            port: portBitMask,
            power,
            degrees: pos,
            bytes: Array.from(command)
        });

        return command;
    }

    static createStopCommand(port: number): Buffer {
        const portBitMask = 1 << port;
        
        const command = Buffer.alloc(5);
        command[0] = this.DIRECT_COMMAND_NO_REPLY;
        command[1] = this.LC0;
        command[2] = this.GC0;
        command[3] = this.opOUTPUT_STOP;
        command[4] = portBitMask;

        logger.debug('Created stop command:', {
            command: command.toString('hex'),
            port: portBitMask
        });

        return command;
    }

    static createResetCommand(port: number): Buffer {
        const command = Buffer.alloc(4);
        
        // command[0] = CommandType.DirectCommand;
        // command[1] = 0x00;
        // command[2] = OperationType.OutputReset;
        // command[3] = port;
        
        return command;
    }
}