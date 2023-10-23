import Router from "@koa/router";
import { KoaAppState, KoaAppContext, KoaApp } from "../app.js";
import authRouter from "../routes/auth.js";
import postsRouter from "../routes/post.js";
import profilesRouter from "../routes/profiles.js";
import uploadsRouter from "../routes/uploads.js";

const routers: Router<KoaAppState, KoaAppContext>[] = [
	authRouter,
	postsRouter,
	profilesRouter,
	uploadsRouter,
];

async function registerRouters(baseUriPath: string, app: KoaApp) {
	const baseRouter = new Router<KoaAppState, KoaAppContext>({
		prefix: baseUriPath,
	});
	for (const router of routers) {
		baseRouter.use(router.routes());
		baseRouter.use(router.allowedMethods());
	}
	app.use(baseRouter.routes());
}

export default registerRouters;
