import { REGISTER_LENGTH, Register, RegisterConfiguration } from './Register';

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

			let readValue;
			if (r.nbNativeRegisters === 1) {
				readValue = r.signed ? buffer.readInt16BE(bufferOffset) : buffer.readUInt16BE(bufferOffset);
			} else if (r.nbNativeRegisters === 2) {
				readValue = r.signed ? buffer.readInt32BE(bufferOffset) : buffer.readUInt32BE(bufferOffset);
			} else {
				throw new Error("Can't extract values which aren't using 1 or 2 registers.");
			}

			values.push({
				label: r.label,
				data: r.convertValue(readValue),
				unit: r.unit
			});

			// 1 register is 16 bits => 2 bytes
			bufferOffset += r.nbNativeRegisters * (REGISTER_LENGTH / 8);
		});
		return values;
	}
}
