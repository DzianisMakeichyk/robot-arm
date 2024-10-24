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