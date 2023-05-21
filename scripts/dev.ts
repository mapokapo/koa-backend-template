import { spawn } from "child_process";
import logger from "./logger.js";

const main = async () => {
	logger.info("Starting in dev mode...");

	spawn(
		"nodemon",
		[
			"-w",
			"src",
			"-x",
			"ts-node-esm",
			"-i",
			"scripts/**/*",
			"-i",
			"test/**/*",
			"src/index.ts",
		],
		{
			stdio: "inherit",
		}
	);
};

main();
