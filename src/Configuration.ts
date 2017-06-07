import { ControllerConfiguration } from './model/Controller';

export interface Configuration {
	readInterval?: number;
	requiredOccurences?: number;
	inMemoryDB?: boolean;
	controllers?: ControllerConfiguration[];
}
