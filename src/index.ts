import { PrismaClient } from "@prisma/client";
import App from "./app.js";
import configSchema, { Config } from "./schemas/config.js";
import { defaultLogger } from "./lib/logger.js";
import admin from "firebase-admin";
import * as dotenv from "dotenv";

async function main() {
	const logger = defaultLogger;

	let config: Config, prisma: PrismaClient, firebaseAdmin: admin.app.App;

	logger.info("Loading environment variables...");
	try {
		config = configSchema.parse(dotenv.config().parsed);
	} catch (e) {
		logger.error(
			`Failed to parse environment variables\n${
				e instanceof Error ? e.stack : e
			}`
		);
		process.exit(1);
	}

	logger.info("Connecting to database...");
	prisma = new PrismaClient();
	try {
		await prisma.$connect();
	} catch (e) {
		logger.error(
			`Failed to connect to database\n${e instanceof Error ? e.stack : e}`
		);
		await prisma.$disconnect();
		process.exit(1);
	}

	logger.info("Connecting to Firebase...");
	try {
		firebaseAdmin = admin.initializeApp({
			credential: admin.credential.cert("./service_account_key.json"),
		});
	} catch (e) {
		logger.error(
			`Failed to connect to Firebase\n${e instanceof Error ? e.stack : e}`
		);
		await prisma.$disconnect();
		process.exit(1);
	}

	const app = new App(config, prisma, firebaseAdmin, logger);
	await app.start();
}

main();
