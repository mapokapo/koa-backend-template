import Router from "@koa/router";
import { KoaAppContext, KoaAppState } from "../app.js";
import authGuard from "../middleware/authGuard.js";
import createProfileRequest from "../schemas/requests/postProfileRequest.js";
import profilesService from "../services/profilesService.js";

const authRouter = new Router<KoaAppState, KoaAppContext>({
	prefix: "/auth",
});

// Register a new user, this requires a Firebase ID token but doesn't require an existing user in the database
authRouter.post(
	"/register",
	authGuard({ requiresProfile: false }),
	async ctx => {
		const body = createProfileRequest.parse(ctx.request.body);

		const existingProfile = await profilesService.getByIdOrEmail(
			ctx,
			ctx.state.uid,
			body.email
		);

		if (existingProfile !== null) {
			ctx.status = 409;
			ctx.body = {
				error: "Profile already exists",
			};
			return;
		}

		const profile = await profilesService.create(ctx, ctx.state.uid, body);

		ctx.body = profile;
	}
);

export default authRouter;
