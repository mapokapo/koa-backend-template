import * as url from "url";
import { stat } from "fs/promises";
import { join } from "path";
import { spawn } from "child_process";
import ora from "ora";
import logger from "./logger.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const directoryExists = async (path: string) => {
	try {
		const stats = await stat(path);
		return stats.isDirectory();
	} catch (e) {
		return false;
	}
};

const main = async () => {
	const spinner = ora("Finding build\n").start();

	const buildExists = await directoryExists(join(__dirname, "../dist"));

	if (buildExists) {
		spinner.succeed("Found build");

		logger.info("Starting server");
		const child = spawn("node", [join(__dirname, "../dist/index.js")], {
			stdio: "inherit",
		});

		child.stdout?.on("data", data => {
			console.log(data.toString());
		});
		child.stderr?.on("data", data => {
			console.error(data.toString());
		});

		child.on("close", code => {
			logger.info("Closing server");
			process.exit(code ?? undefined);
		});
	} else {
		spinner.stopAndPersist({
			symbol: "❌",
		});
		logger.error("Build does not exist. Please run `npm run build`");
		process.exit(1);
	}
};

main();
