import Router from "@koa/router";
import { z } from "zod";
import { KoaAppContext, KoaAppState } from "../app.js";
import authGuard from "../middleware/authGuard.js";

const authRouter = new Router<KoaAppState, KoaAppContext>({
	prefix: "/auth",
});

// Register a new user, this requires a Firebase ID token but doesn't require an existing user in the database
authRouter.post(
	"/register",
	authGuard({ requiresProfile: false }),
	async ctx => {
		const body = z
			.object({
				firebaseUid: z.string(),
				name: z.string(),
				email: z.string(),
				imageUrl: z.string().optional(),
			})
			.parse(ctx.request.body);
		const existingProfile = await ctx.prisma.profile.findUnique({
			where: {
				firebaseUid: body.firebaseUid,
			},
		});
		if (existingProfile !== null) {
			ctx.status = 409;
			ctx.body = {
				error: "Profile already exists",
			};
			return;
		}
		const profile = await ctx.prisma.profile.create({
			data: {
				firebaseUid: body.firebaseUid,
				name: body.name,
				email: body.email,
				imageUrl: body.imageUrl,
			},
		});
		ctx.body = profile;
	}
);

export default authRouter;
