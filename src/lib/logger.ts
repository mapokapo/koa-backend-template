import chalk from "chalk";

export type LevelString =
	| "trace"
	| "debug"
	| "info"
	| "warn"
	| "error"
	| "fatal";
const levels: LevelString[] = [
	"trace",
	"debug",
	"info",
	"warn",
	"error",
	"fatal",
];

export type Logger = {
	[level in LevelString]: (message: string) => void;
};

interface LoggerOptions {
	level?: LevelString;
	prefix?: string | ((level: LevelString) => string);
	includeTimestamp?: boolean;
	stderr?: boolean;
}

const defaultOptions = {
	level: "info",
	prefix: "",
	includeTimestamp: true,
	stderr: false,
} satisfies LoggerOptions;

const createLogger = (_opts: LoggerOptions) => {
	const opts = {
		...defaultOptions,
		..._opts,
	};
	const stream = opts.stderr ? process.stderr : process.stdout;
	const logger = {} as Logger;

	const shouldLog = (level: LevelString) => {
		return levels.indexOf(level) >= levels.indexOf(opts.level);
	};

	for (const level of levels) {
		logger[level] = (message: string) => {
			if (!shouldLog(level)) {
				return;
			}

			const prefix =
				typeof opts.prefix === "function"
					? opts.prefix(level)
					: opts.prefix ?? "";

			const date = new Date();
			const timestamp = opts.includeTimestamp
				? `[${date.getHours().toString().padStart(2, "0")}:${date
						.getMinutes()
						.toString()
						.padStart(2, "0")}:${date
						.getSeconds()
						.toString()
						.padStart(2, "0")}.${(date.getMilliseconds() / 1000)
						.toFixed(3)
						.slice(2, 5)}] `
				: "";

			stream.write(`${timestamp + prefix} ${message}`);

			if (!message.endsWith("\n")) {
				stream.write("\n");
			}
		};
	}

	return logger;
};

const defaultLogger = createLogger({
	level: "debug",
	prefix: level => {
		let color: keyof typeof chalk;
		switch (level) {
			case "trace":
				color = "gray";
				break;
			case "debug":
				color = "blue";
				break;
			case "info":
				color = "green";
				break;
			case "warn":
				color = "yellow";
				break;
			case "error":
				color = "red";
				break;
			case "fatal":
				color = "red";
				break;
			default:
				color = "white";
		}

		return `[${chalk[color](level)}]`;
	},
});

export { defaultLogger, createLogger };
