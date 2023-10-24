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
	const firebaseUid = firebaseUidPathParamSchema.parse(ctx.params["id"]);

	const profile = await profilesService.getById(ctx, firebaseUid);

	if (!profile) {
		ctx.status = 404;
		ctx.body = {
			error: "Profile not found",
		};
		return;
	}

	ctx.body = profile;
});
profilesRouter.patch("/:id", authGuard(), async ctx => {
	const firebaseUid = firebaseUidPathParamSchema.parse(ctx.params["id"]);

	const profile = await profilesService.getById(ctx, firebaseUid);

	if (!profile) {
		ctx.status = 404;
		ctx.body = {
			error: "Profile not found",
		};
		return;
	}

	if (profile.firebaseUid !== ctx.state.user.firebaseUid) {
		ctx.status = 403;
		ctx.body = {
			error: "Forbidden",
		};
		return;
	}

	const body = patchProfileRequestSchema.parse(ctx.request.body);

	const updatedProfile = await profilesService.update(ctx, firebaseUid, body);

	ctx.body = updatedProfile;
});

export default profilesRouter;
