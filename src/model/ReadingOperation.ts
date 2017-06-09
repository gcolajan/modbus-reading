import { Register } from './Register';
import { TypeBufferHelper } from '../helpers/TypeBufferHelper';

export class ReadingOperation {

	private _registers: Register[];

	get address(): number { return this._registers[0].address; }
	get nbRegisters(): number { return this._registers.map(r => r.nbNativeRegisters).reduce((p, c) => p + c); }

	constructor(register: Register) {
		this._registers = [];
		this.addRegister(register);
	}

	addRegister(register: Register): void {
		if (!this.isMergeable(register)) {
			throw new Error('Can\'t merge discontinuous registers in one reading operation');
		}

		this._registers.push(register);
	}

	isMergeable(register: Register): boolean {
		if (this._registers.length === 0) {
			return true;
		}

		return this.address + this.nbRegisters === register.address;
	}

	recompose(buffer: Buffer): any[] {
		const values = [];
		let bufferOffset = 0;
		this._registers.forEach(r => {
			const readValue = TypeBufferHelper.read(r.type, buffer, bufferOffset);
			values.push({
				label: r.label,
				data: r.convertValue(readValue),
				unit: r.unit
			});

			bufferOffset += TypeBufferHelper.getLength(r.type) / 8;
		});
		return values;
	}
}
