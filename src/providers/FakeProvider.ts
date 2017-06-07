import { BaseProvider } from "./BaseProvider";

export class FakeProvider extends BaseProvider {

    constructor(host: string, port: number, deviceNumber: number) {
        super(host, port, deviceNumber);
    }

    buildBuffer(values: number[], nbBytes: number): Buffer {
        const buffer = new Buffer(nbBytes);
        values.forEach((v, i) => {
            buffer.writeInt16BE(v, i * 2);
        });

        return buffer;
    }

    /**
     * WARNING! Can only provide 16 bits (INT16) registers
     */
    read(address: number, nbRegisters: number): Promise<any> {
        const values: number[] = [];
        for (let i = 0 ; i < nbRegisters ; i++) {
            values[i] = Math.round(((address + i) + Math.random()) * 10);
        }

        return new Promise((resolve:any) => {
            return resolve({
                data: values,
                buffer: this.buildBuffer(values, nbRegisters * 2)
            });
        });
    }
}
