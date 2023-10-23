import Router from "@koa/router";
import { KoaAppContext, KoaAppState } from "../app.js";
import authGuard from "../middleware/authGuard.js";
import firebaseUidPathParamSchema from "../schemas/pathParams/firebaseUid.js";
import profilesService from "../services/profilesService.js";
import patchProfileRequestSchema from "../schemas/requests/patchProfileRequest.js";

const profilesRouter = new Router<KoaAppState, KoaAppContext>({
	prefix: "/profiles",
});

profilesRouter.get("/:id", authGuard(), async ctx => {
	const id = firebaseUidPathParamSchema.parse(ctx.params["id"]);

	const profile = await profilesService.getProfileByFirebaseUid(ctx, id);

	if (!profile) {
		ctx.status = 404;
		return;
	}

	ctx.body = profile;
});
profilesRouter.patch("/:id", authGuard(), async ctx => {
	const user = ctx.state.user;

	const id = firebaseUidPathParamSchema.parse(ctx.params["id"]);

	const profile = await profilesService.getProfileByFirebaseUid(ctx, id);

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

	const body = patchProfileRequestSchema.parse(ctx.request.body);

	const updatedProfile = await profilesService.updateProfile(ctx, id, body);

	ctx.body = updatedProfile;
});

export default profilesRouter;
