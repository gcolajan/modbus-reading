namespace M2C.Model {

	export class TimestampedData<T> {
	
		private _time: Date;
		private _val: T;

		get time(): Date { return this._time; }
		set time(value: Date) { this._time = value; }

		get val(): T { return this._val; }
		set val(value: T) { this._val = value; }
	
		constructor(time: Date, val: T) {
			this._time = time;
			this._val = val;
		}

		static fromValue<T>(value: T): TimestampedData<T> {
			return new TimestampedData(new Date(), value);
		}
	}
}
