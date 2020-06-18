interface Log {
	trace: (msg: string) => void;
	debug: (msg: string) => void;
	info: (msg: string) => void;
	warn: (msg: string) => void;
	error: (msg: string) => void;
	fatal: (msg: string) => void;
}

interface SimpleNodeLogger {
	createSimpleFileLogger(path: string): Log;
}

//@ts-ignore
import simpleNodeLogger from 'simple-node-logger';

const logWithConsole = (logger: Log) => ({
	trace: (msg: string) => {
		console.trace(msg);
		logger.trace(msg);
	},
	debug: (msg: string) => {
		console.debug(msg);
		logger.debug(msg);
	},
	info: (msg: string) => {
		console.info(msg);
		logger.info(msg);
	},
	warn: (msg: string) => {
		console.warn(msg);
		logger.warn(msg);
	},
	error: (msg: string) => {
		console.error(msg);
		logger.error(msg);
	},
	fatal: (msg: string) => {
		console.error(msg);
		logger.fatal(msg);
	},
});

export const systemLog = logWithConsole(
	(simpleNodeLogger as SimpleNodeLogger).createSimpleFileLogger(`log-system.log`)
);

export const usersLog = (simpleNodeLogger as SimpleNodeLogger).createSimpleFileLogger(
	`log-users.log`
);
