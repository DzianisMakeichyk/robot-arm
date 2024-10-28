// @ts-nocheck
import SerialPort from 'serialport';

import { createOperationPayload, tone, getLBatt } from '@node-mindstorms/ev3-protocol';

export class Ev3 {

  /**
   *
   */
  port: SerialPort;

  /**
   *
   */
  private _messageCounter: number;
  private readonly _commandQueue: [];
  private readonly _isPortOpen: boolean;

  /**
   *
   * @param serialPort
   */
  constructor (serialPort: string) {
    this._messageCounter = 0;

    this.port = new SerialPort(serialPort, {
      autoOpen: false,
      baudRate: 57600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1
    });
    this._initialisePort();
  }

  /**
   *
   */
  async connect () {
    return new Promise(((resolve: Function, reject: Function) => {
      this.port.open((err: Error) => {
        if (err) {
          reject(err);
        }
        resolve();
      })
    }));
  }

  async disconnect() {
    return new Promise(((resolve: Function, reject: Function) => {
      this.port.close((err: Error) => {
        if (err) {
          reject(err);
        }
        resolve();
      })
    }));
  }

  /**
   *
   * @param volume
   * @param frequency
   * @param duration
   */
  async tone (volume: number, frequency: number, duration: number) {
    const result = await this.execute(tone(volume, frequency, duration));
    return this._delay(duration);
  };

  /**
   *
   */
  async getLBatt () {
    return this.execute(getLBatt());
  };

  /**
   *
   * @param operation
   */
  async execute (operation: Buffer) {
    return new Promise(((resolve, reject) => {
      const operationPayload = createOperationPayload(operation, this._messageCounter);
      console.log(`WRITE: ${operationPayload.toString('hex').toUpperCase()}`);
      this.port.write(operationPayload, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
      this._messageCounter++;
    }))
  }

  /**
   *
   * @private
   */
  private async _delay (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));

  }

  /**
   *
   * @private
   */
  private _initialisePort () {
    this.port.on('data', (data: any) => {
      console.dir(data);
    });
  }

  /**
   *
   */
  get isPortOpen(): boolean {
    return this._isPortOpen;
  }
}