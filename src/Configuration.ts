import { ControllerConfiguration } from './model/Controller';

export interface IntervalConfiguration {
	scheduled?: boolean | string;
	interval?: number;
	requiredOccurences?: number;
}

export interface Configuration {
	inMemoryDB?: boolean;
	interventionTime?: string;
	readFrequency?: IntervalConfiguration;
	controllers?: ControllerConfiguration[];
}
