import * as ModbusRTU from "modbus-serial";
import { BaseProvider } from "./BaseProvider";

export class ModBusProvider extends BaseProvider {

    private client: ModbusRTU.IModbusRTU;
    private isOpen: boolean;

    constructor(host: string, port: number, deviceNumber: number) {
        super(host, port, deviceNumber);
        this.client = new ModbusRTU();
        this.client.setID(this.deviceNumber);
    }

    connect(): Promise<any> {
        return new Promise((resolve, reject) => {
            try{   
                this.client.connectTCP(this.host, {port: this.port}, resolve);
            } catch(e) {
                reject(e);
            }
        });
    }

    read(address: number, nbRegisters: number): Promise<ModbusRTU.ReadRegisterResult> {
        return this.client.readHoldingRegisters(address, nbRegisters);
    }

    close(): void {
        return this.client.close(() => {});
    }
}
