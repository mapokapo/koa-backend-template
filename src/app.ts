import Koa from "koa";
import koaLogger from "koa-logger";
import { Config } from "./schemas/config.js";
import { Logger, defaultLogger } from "./lib/logger.js";
import bodyParser from "koa-bodyparser";
import registerRouters from "./lib/registerRouters.js";
import { PrismaClient, Profile } from "@prisma/client";
import zodErrors from "./middleware/zodErrors.js";
import admin from "firebase-admin";

export interface KoaAppContext extends Koa.Context {
	prisma: PrismaClient;
	firebaseAdmin: admin.app.App;
	logger: Logger;
}
export interface KoaAppState extends Koa.DefaultState {
	user?: Profile;
}

export type KoaApp = Koa<KoaAppState, KoaAppContext>;

export default class App {
	public koaApp: KoaApp;
	private logger: Logger;
	private listener: ReturnType<typeof Koa.prototype.listen> | null = null;

	// Global contexts
	private config: Config;
	private prisma: PrismaClient;
	private firebaseAdmin: admin.app.App;

	constructor(
		config: Config,
		prisma: PrismaClient,
		firebaseAdmin: admin.app.App,
		logger?: Logger
	) {
		this.config = config;
		this.prisma = prisma;
		this.firebaseAdmin = firebaseAdmin;
		this.logger = logger ?? defaultLogger;

		this.logger.info("Initializing server...");

		this.koaApp = new Koa();
	}

	public async start() {
		this.logger.info("Configuring global contexts...");
		this.koaApp.context.prisma = this.prisma;
		this.koaApp.context.firebaseAdmin = this.firebaseAdmin;
		this.koaApp.context.logger = this.logger;

		this.logger.info("Configuring middleware...");
		this.koaApp.use(
			koaLogger({
				transporter: (str, args) => {
					const formattedStr = " " + str.trimStart();
					const firstDigit = args[3]?.toString().charAt(0);
					if (firstDigit === "4" && args[3] !== 404) {
						this.logger.warn(formattedStr);
					} else if (firstDigit === "5") this.logger.error(formattedStr);
					else this.logger.info(formattedStr);
				},
			})
		);
		this.koaApp.use(bodyParser());
		this.koaApp.use(zodErrors());

		this.logger.info("Registering routes...");
		registerRouters("/api", this.koaApp);

		this.listener = this.koaApp.listen(this.config.PORT).on("listening", () => {
			this.logger.info(`✅ Listening on http://localhost:${this.config.PORT}`);
		});
	}

	public async stop() {
		this.logger.info("Stopping server...");
		if (this.listener) this.listener.close();
		await this.prisma.$disconnect();
	}
}
