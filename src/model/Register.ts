// One register is 2 bytes
export const REGISTER_LENGTH = 16;

export interface RegisterConfiguration {
	label: string;
	address: number;
	length: number;
	signed: boolean;
	unit: string;
	coefficient: number;
}

export class Register {

	private _label: string;
	private _address: number;
	private _length: number;
	private _signed: boolean;
	private _unit: string;
	private _coefficient: number;

	get label(): string { return this._label; }
	get address(): number { return this._address; }
	get length(): number { return this._length; }
	get nbNativeRegisters(): number { return this._length / REGISTER_LENGTH; }
	get signed(): boolean { return this._signed; }
	get unit(): string { return this._unit; }
	get coefficient(): number { return this._coefficient; }

	constructor(conf: RegisterConfiguration) {
		this._label = conf.label;
		this._address = conf.address;
		this._length = conf.length;
		this._signed = conf.signed;
		this._unit = conf.unit;
		this._coefficient = conf.coefficient;
	}

	/**
	 * Convert the value with the provided coefficient
	 * 
	 * @param {number} rawValue Value as read from the controller
	 * @returns {number} 
	 */
	convertValue(rawValue: number): number {
		return rawValue * this.coefficient;
	}
}