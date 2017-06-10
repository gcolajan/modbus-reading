# ModBus reading

[![Build Status](https://travis-ci.org/gcolajan/modbus-reading.svg?branch=master)](https://travis-ci.org/gcolajan/modbus-reading)

Tool dedicated to read several registers on several controllers through ModBus protocol. The interval between readings is configurable, data can be aggregated before storage.

The purpose is to expose CSV files through HTTP.

Maintenance process (00:30, daily):

 * daily report is generated inside `report` folder (`YYYY-MM-DD.csv`)
 * DB is cleared of data older than 2 months
 * 1st of the month, a monthly report is created (`YYYY-MM.csv`)
 * 10th of the month, daily CSV files of past month are cleared

## Usage

### Installation

This project use TypeScript and Node.js. Please install Node.js first.
```
npm install
```

### Start

Take time to configure your project with the `config.json` file. The *start* target will run the service and the HTTP server (http://localhost:8080/).
```
npm start
```

### Debug

You can also run one thing at a time.
```
npm start:web
npm start:service [debug]
```

With the `debug` on *start:service*, you will be able to run the script without any ModBus controller. It will also trigger the maintenance process before starting.

### Specific extract

If for any reason you need to generate a custom extract from DB, you could use:
```
npm run extract YYYY-MM-DD YYYY-MM-DD custom_output.csv
```

It would be generated inside *reports/custom*.

Keep in mind you would be able to run this if the data is still present in the database (2 months).

## Configuration

Use `config.json.example` as a base.

The DB is mostly used to keep data in safe place before creating the reports. Keep in mind that an in-memory DB wouldn't loose the history if the process is stopped.

```js
{
	// Specify to save DB in memory
	"inMemoryDB": false,
	// Time, as cron format, where we should run the daily tasks
	"interventionTime": "30 0 * * *",
	"readFrequency": {
		// Time between two read operations (ms), won't be used if scheduled
		"interval": 60000,
		// How many reading to do before inserting the average of them into DB
		"requiredOccurences": 5,
		// If false, would be interval-based, otherwise, you can specify a cron compatible syntax: "1 * * * *"
		"scheduled": false
	},
	"controllers": [
		{
			// Controller's name, to be printed inside reports
			"name": "DEMO",
			 // IP address to the ModBus controller
			"address": "127.0.0.1",
			// Port used (null for default)
			"port": "502",
			// Slave id, if unknown, set to 1
			"slaveId": 1,
			// List of registers to read from current controller
			"registers": [
				// Specify the address, and the type with length and signed or not (supported: INT16, UINT16, INT32, UINT32, FLOAT32),
				//  the unit to store into DB and coefficient to apply before storage
				{"label": "Ia", "address": 154, "type": "INT16", "unit": "A", "coefficient": 1.0}
			]
		}	
	]
}
```

Recognized types: `INT16`, `UINT16`, `INT32`, `UINT32` and `FLOAT32`.

## Output files

An example of files the service would generate daily.

```CSV
"Timestamp UTC","Timestamp","Value","Source","Measurement","Unit"
"2017-06-02 22:19:00","2017-06-02 18:19:00","149.5400","DEMO","Ia","A"
"2017-06-02 22:20:00","2017-06-02 18:20:00","150.3200","DEMO","Ia","A"
"2017-06-02 22:21:00","2017-06-02 18:21:00","151.7000","DEMO","Ia","A"
```

## Production running suggestion

On a Debian-based distribution

```sh
# Install recent version of Node.js

cd ~
git clone https://github.com/gcolajan/modbus-reading.git
cd modbus-reading
npm install

cd ~
sudo npm install -g pm2
pm2 startup
pm2 start modbus-reading/build/index.js -n modbusread

sudo apt-get install nginx
sudo nano /etc/nginx/site-available/default
# Change root for <HOME>/modbus-reading/reports/
# Add "autodindex on;" for file discovery
sudo service nginx restart
```