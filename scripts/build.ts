import * as url from "url";
import { stat } from "fs/promises";
import { join } from "path";
import { spawn } from "child_process";
import ora from "ora";
import logger from "./logger.js";
import { rimraf } from "rimraf";

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
	const buildExists = await directoryExists(join(__dirname, "../dist"));

	if (buildExists) {
		const spinner = ora("Removing old build\n").start();
		const success = await rimraf(join(__dirname, "../dist"));
		if (success) {
			spinner.succeed("Removed old build");
		} else {
			spinner.stopAndPersist({
				symbol: "❌",
			});
			logger.error("Failed to remove old build");
			process.exit(1);
		}
	}

	const spinner = ora("Building project\n").start();

	const child = spawn("tsc", ["--build", "tsconfig.json"], {
		stdio: "inherit",
	});

	child.on("close", async code => {
		if (code === 0) {
			spinner.succeed("Built project");
			logger.info("Built project. Start the server with `npm run start`");
		} else {
			spinner.stopAndPersist({
				symbol: "❌",
			});
			logger.error("Build failed");
			process.exit(code ?? undefined);
		}
	});
};

main();
