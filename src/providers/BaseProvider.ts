export class BaseProvider {

	private _host: string;
	private _port: number;
	private _deviceNumber: number;

	get host(): string { return this._host; }
	get port(): number { return this._port; }
	get deviceNumber(): number { return this._deviceNumber; }

	constructor(host: string, port: number, deviceNumber: number) {
		this._host = host;
		this._port = port;
		this._deviceNumber = deviceNumber;
	}

	connect(): Promise<any> {
		return Promise.resolve();
	}

	read(address: number, nbRegisters: number): Promise<any> {
		throw new Error('Not implemented');
	}

	close(): void {}
}