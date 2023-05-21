import chalk from "chalk";
import { createLogger } from "../src/lib/logger.js";

const logger = createLogger({
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

export default logger;
