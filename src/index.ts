import * as schedule from 'node-schedule';
import { Configuration } from './Configuration';
import { createControllers } from './helpers/ConfigHelper';
import { DatasetHelper } from './helpers/DatasetHelper';
import { ExtractHelper } from './helpers/ExtractHelper';
import { CsvHelper } from './helpers/CsvHelper';
import { FakeProvider } from './providers/FakeProvider';
import { ModBusProvider } from './providers/ModBusProvider';
import { Storage } from './database/Storage';

const config = require('../config.json') as Configuration;
const controllers = createControllers(config.controllers);
const storage = new Storage(config.inMemoryDB);

const args = process.argv.slice(2);
const debugMode = args.length === 1;
if (debugMode) {
	console.warn('Debug mode enabled!');
}

console.log(`Service started (frq: ${config.readFrequency.interval}ms, occ: ${config.readFrequency.requiredOccurences})!`);


// Define operation that should be executed every day
const dailyOperation = () => {
	const currentDate = new Date();

	ExtractHelper.yesterday(storage);

	if (debugMode || currentDate.getDate() === 1) {
		ExtractHelper.lastMonth(storage);
	}

	if (debugMode || currentDate.getDate() === 10) {
		CsvHelper.cleanLastMonthFiles();
	}

	storage.cleanOldData(62);
};

// Execute every day at 00:30
schedule.scheduleJob(config.interventionTime, dailyOperation);
debugMode && dailyOperation();

// Declare the functions used to retrieve data from each controllers
const ChosenProvider = debugMode ? FakeProvider : ModBusProvider;
const controllerFetching = controllers.map(c => {
	const provider = new ChosenProvider(c.address, c.port, c.slaveId);
	return () => {
		const date = new Date();
		let promise = provider.connect();
		promise = promise.then(() => []);

		c.readings.forEach(r => {
			promise = promise.then((v: any[]) => provider.read(r.address, r.nbRegisters).then(raw => { v.push(r.recompose(raw.buffer)); return v; }));
		});

		promise = promise.catch(err => console.error('Error encountered with controller fetching:', err));
		promise = promise.then(values => {
			provider.close();
			return {
				time: date,
				name: c.name,
				data: DatasetHelper.flatten(values)
			}
		});

		return promise;
	}
});


// Initializing buffer
const buffer = [];
controllerFetching.forEach((v, i) => buffer[i] = []);

// At each call, we will run the controller fetching operation and save it to DB every required interval
const fetchFunction = () => {
	// For each controller, store dataset obtained into a buffer
	console.log('[' + new Date().toISOString() + '] fetch');
	controllerFetching.forEach((fetch, index) => {
		fetch()
			.then(dataset => {
				buffer[index] = [dataset, ...buffer[index]];
				if (buffer[index].length % config.readFrequency.requiredOccurences === 0) {
					const summarizedData = DatasetHelper.summarize(buffer[index]);
					storage.save(summarizedData);
					storage.close();

					buffer[index] = [];
				}
			})
			.catch(reason => console.error(reason));
	});
};

// Run!
if (config.readFrequency.scheduled) {
	schedule.scheduleJob(config.readFrequency.scheduled, fetchFunction);
}
else {
	fetchFunction();
	setInterval(fetchFunction, config.readFrequency.interval);
}
