// WARNING, be cautious by manipulating UTC/Local and dates operations

export function getCurrentSqlLocal(): string {
	return getSqlLocal(new Date());
}

export function getCurrentSqlUtc(): string {
	return getSqlUtc(new Date());
}

export function getSqlLocal(date: Date): string {
	return date.getUTCFullYear() + '-' +
		('00' + (date.getMonth()+1)).slice(-2) + '-' +
		('00' + date.getDate()).slice(-2) + ' ' + 
		('00' + date.getHours()).slice(-2) + ':' + 
		('00' + date.getMinutes()).slice(-2) + ':' + 
		('00' + date.getSeconds()).slice(-2);
}

export function getSqlUtc(date: Date): string {
	return date.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Convert an ISO local date to UTC Date
 * e.g. 2015-11-24T19:40:00
 */
export function parseISOLocal(strISODate: string): Date {
	const b = strISODate.split(/\D/) as any[];
	return new Date(b[0], b[1]-1, b[2], b[3], b[4], b[5]);
}