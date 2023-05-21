import Router from "@koa/router";
import { z } from "zod";
import { KoaAppContext, KoaAppState } from "../app.js";
import authGuard from "../middleware/authGuard.js";
import { Profile } from "@prisma/client";

const profilesRouter = new Router<KoaAppState, KoaAppContext>({
	prefix: "/profiles",
});

profilesRouter.get("/:id", authGuard({ requiresProfile: false }), async ctx => {
	const id = z.string().parse(ctx.params["id"]);
	const profile = await ctx.prisma.profile.findUnique({
		where: {
			firebaseUid: id,
		},
	});
	if (!profile) {
		ctx.status = 404;
		return;
	}
	ctx.body = profile;
});
profilesRouter.patch(
	"/:id",
	authGuard({ requiresProfile: false }),
	async ctx => {
		const user = ctx.state.user as Profile;
		const id = z.string().parse(ctx.params["id"]);
		const profile = await ctx.prisma.profile.findUnique({
			where: {
				firebaseUid: id,
			},
		});
		if (!profile) {
			ctx.status = 404;
			ctx.body = {
				error: "Profile not found",
			};
			return;
		}
		if (profile.firebaseUid !== user.firebaseUid) {
			ctx.status = 403;
			ctx.body = {
				error: "Forbidden",
			};
			return;
		}
		const body = z
			.object({
				name: z.string().optional(),
				imageUrl: z.string().optional(),
			})
			.parse(ctx.request.body);
		const updatedProfile = await ctx.prisma.profile.update({
			where: {
				firebaseUid: id,
			},
			data: {
				name: body.name,
				imageUrl: body.imageUrl,
			},
		});
		ctx.body = updatedProfile;
	}
);

export default profilesRouter;
