import { Storage, RowFunction } from '../database/Storage';
import { RowExtractor } from '../extractors/RowExtractor';
import { CsvHelper } from './CsvHelper';

const MAX_PRECISION = 4;

export class ExtractHelper {

	static yesterday(storage: Storage): void {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);

		const extractor = new RowExtractor();
		ExtractHelper.configureExtractor(extractor);
		extractor.setReader((callback: RowFunction, endCb: Function) => storage.read(yesterday, callback, endCb));
		extractor.writeCSV(CsvHelper.getYesterdayName(), ',', '"', (nbRow) => {
			console.log(`Daily report done! ${nbRow} row(s) extracted.`);
		});
	}

	static lastMonth(storage: Storage): void {
		const lastMonth = new Date();
		lastMonth.setMonth(lastMonth.getMonth() - 1);

		const extractor = new RowExtractor();
		ExtractHelper.configureExtractor(extractor);
		extractor.setReader((callback: RowFunction, endCb: Function) => storage.readMonth(lastMonth.getFullYear(), lastMonth.getMonth(), callback, endCb));
		extractor.writeCSV(CsvHelper.getLastMonthName(), ',', '"', (nbRow) => {
			console.log(`Monthly report done! ${nbRow} row(s) extracted.`);
		});
	}

	private static configureExtractor(extractor: RowExtractor): void {
		extractor.setColumnNames("Timestamp UTC", "Timestamp", "Value", "Source", "Measurement", "Unit");
		extractor.setFormatFunction((row) => {
			const val = row["value"] ? row["value"].toFixed(MAX_PRECISION) : "NULL";
			return [row["date_utc"], row["date_local"], val, row["controller"], row["register"], row["unit"]];
		});
	}
}
