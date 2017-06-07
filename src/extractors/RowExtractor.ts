import { RowFunction } from "../database/Storage";
import { CsvHelper } from "../helpers/CsvHelper";
import * as fs from 'fs';

export type FormatFunction = (row: any[]) => any[];
export type RowReader = (callback: RowFunction, endCb: Function) => void;

export class RowExtractor {
	private _reportDir: string;
	private _columns: string[];
	private _reader: RowReader;
	private _format: FormatFunction;

	constructor(reportDir: string = "./reports/") {
		this._reportDir = reportDir;
	}

	setReader(reader: RowReader): void {
		this._reader = reader;
	}

	setColumnNames(...headers: string[]): void {
		this._columns = headers;
	}

	setFormatFunction(format: FormatFunction): void {
		this._format = format;
	}

	writeCSV(outputFile: string, separator: string = ',', delimiter: string = '"', next?: Function): void {
		const outputStream = fs.createWriteStream(this._reportDir + outputFile, {'flags': 'w'});
		outputStream.write(this.csvify(this._columns, separator, delimiter));

		let nbRow = 0;
		this._reader((err, row) => {
			const separatedValues = this._format(row);
			const str = this.csvify(separatedValues, separator, delimiter);
			outputStream.write(str);
			nbRow += 1;
		}, () => {
			outputStream.end();
			next && next(nbRow);
		});
	}

	private csvify(values: any[], separator: string, delimiter: string): string {
		return values.map(v => delimiter + v + delimiter).join(separator) + "\n";
	}
}
