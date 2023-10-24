import Router from "@koa/router";
import { KoaAppContext, KoaAppState } from "../app.js";
import authGuard from "../middleware/authGuard.js";
import fileUploadMiddleware from "../middleware/fileUploadMiddleware.js";
import send from "koa-send";
import * as path from "path";
import uploadsService from "../services/uploadsService.js";
import idPathParamSchema from "../schemas/pathParams/id.js";

const uploadsRouter = new Router<KoaAppState, KoaAppContext>({
	prefix: "/uploads",
});

uploadsRouter.get("/", authGuard(), async ctx => {
	const uploads = await uploadsService.getAllForUser(
		ctx,
		ctx.state.user.firebaseUid
	);

	ctx.body = uploads;
});
uploadsRouter.get("/:id", authGuard(), async ctx => {
	const id = idPathParamSchema.parse(ctx.params["id"]);

	const upload = await uploadsService.getById(ctx, id);

	if (!upload) {
		ctx.body = {
			error: "Upload not found",
		};
		ctx.status = 404;
		return;
	}

	if (upload.ownerUid !== ctx.state.user.firebaseUid) {
		ctx.body = {
			error: "Forbidden",
		};
		ctx.status = 403;
		return;
	}

	ctx.body = upload;
});
uploadsRouter.get("/:id/download", authGuard(), async ctx => {
	const id = idPathParamSchema.parse(ctx.params["id"]);

	const upload = await uploadsService.getById(ctx, id);

	if (!upload) {
		ctx.body = {
			error: "Upload not found",
		};
		ctx.status = 404;
		return;
	}

	if (upload.ownerUid !== ctx.state.user.firebaseUid) {
		ctx.body = {
			error: "Forbidden",
		};
		ctx.status = 403;
		return;
	}

	await send(ctx, path.join("uploads", upload.fileName));
});
uploadsRouter.post(
	"/",
	fileUploadMiddleware().single("file"),
	authGuard(),
	async ctx => {
		const file = ctx.request.file;

		const upload = await uploadsService.create(
			ctx,
			ctx.state.user.firebaseUid,
			file
		);

		ctx.body = upload;
	}
);
uploadsRouter.put(
	"/:id",
	fileUploadMiddleware().single("file"),
	authGuard(),
	async ctx => {
		const file = ctx.request.file;

		const id = idPathParamSchema.parse(ctx.params["id"]);

		const upload = await uploadsService.getById(ctx, id);

		if (!upload) {
			ctx.status = 404;
			ctx.body = {
				error: "Upload not found",
			};
			return;
		}

		if (upload.ownerUid !== ctx.state.user.firebaseUid) {
			ctx.status = 403;
			ctx.body = {
				error: "Forbidden",
			};
			return;
		}

		const newUpload = await uploadsService.update(ctx, id, file);

		ctx.body = newUpload;
	}
);
uploadsRouter.delete("/:id", authGuard(), async ctx => {
	const id = idPathParamSchema.parse(ctx.params["id"]);

	const upload = await uploadsService.getById(ctx, id);

	if (!upload) {
		ctx.status = 404;
		ctx.body = {
			error: "Upload not found",
		};
		return;
	}

	if (upload.ownerUid !== ctx.state.user.firebaseUid) {
		ctx.status = 403;
		ctx.body = {
			error: "Forbidden",
		};
		return;
	}

	await uploadsService.delete(ctx, id);

	ctx.status = 204;
});

export default uploadsRouter;
