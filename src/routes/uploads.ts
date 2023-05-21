import Router from "@koa/router";
import { z } from "zod";
import { KoaAppContext, KoaAppState } from "../app.js";
import authGuard from "../middleware/authGuard.js";
import { Profile } from "@prisma/client";
import fileUploadMiddleware from "../middleware/fileUploadMiddleware.js";
import send from "koa-send";
import * as path from "path";

const uploadsRouter = new Router<KoaAppState, KoaAppContext>({
	prefix: "/uploads",
});

uploadsRouter.get("/", authGuard({ requiresProfile: true }), async ctx => {
	const user = ctx.state.user as Profile;
	const uploads = await ctx.prisma.upload.findMany({
		where: {
			ownerUid: user.firebaseUid,
		},
	});
	ctx.body = uploads;
});
uploadsRouter.get("/:id", authGuard({ requiresProfile: true }), async ctx => {
	const user = ctx.state.user as Profile;
	const id = z.coerce.number().parse(ctx.params["id"]);
	const upload = await ctx.prisma.upload.findUnique({
		where: {
			id,
		},
	});
	if (!upload) {
		ctx.body = {
			error: "Upload not found",
		};
		ctx.status = 404;
		return;
	}
	if (upload.ownerUid !== user.firebaseUid) {
		ctx.body = {
			error: "Forbidden",
		};
		ctx.status = 403;
		return;
	}
	ctx.body = upload;
});
uploadsRouter.get(
	"/:id/download",
	authGuard({ requiresProfile: true }),
	async ctx => {
		const user = ctx.state.user as Profile;
		const id = z.coerce.number().parse(ctx.params["id"]);
		const upload = await ctx.prisma.upload.findUnique({
			where: {
				id,
			},
		});
		if (!upload) {
			ctx.body = {
				error: "Upload not found",
			};
			ctx.status = 404;
			return;
		}
		if (upload.ownerUid !== user.firebaseUid) {
			ctx.body = {
				error: "Forbidden",
			};
			ctx.status = 403;
			return;
		}
		await send(ctx, path.join("uploads", upload.fileName));
	}
);
uploadsRouter.post(
	"/",
	fileUploadMiddleware().single("file"),
	authGuard({ requiresProfile: true }),
	async ctx => {
		const user = ctx.state.user as Profile;
		const file = ctx.request.file;
		const upload = await ctx.prisma.upload.create({
			data: {
				fileName: file.filename,
				mimeType: file.mimetype,
				owner: {
					connect: {
						firebaseUid: user.firebaseUid,
					},
				},
			},
		});
		ctx.body = upload;
	}
);
uploadsRouter.put(
	"/:id",
	fileUploadMiddleware().single("file"),
	authGuard({ requiresProfile: true }),
	async ctx => {
		const user = ctx.state.user as Profile;
		const file = ctx.request.file;
		const id = z.coerce.number().parse(ctx.params["id"]);
		const upload = await ctx.prisma.upload.findUnique({
			where: {
				id,
			},
		});
		if (!upload) {
			ctx.status = 404;
			ctx.body = {
				error: "Upload not found",
			};
			return;
		}
		if (upload.ownerUid !== user.firebaseUid) {
			ctx.status = 403;
			ctx.body = {
				error: "Forbidden",
			};
			return;
		}
		const newUpload = await ctx.prisma.upload.update({
			where: {
				id,
			},
			data: {
				fileName: file.filename,
				mimeType: file.mimetype,
			},
		});
		ctx.body = newUpload;
	}
);
uploadsRouter.delete(
	"/:id",
	authGuard({ requiresProfile: true }),
	async ctx => {
		const user = ctx.state.user as Profile;
		const id = z.coerce.number().parse(ctx.params["id"]);
		const upload = await ctx.prisma.upload.findUnique({
			where: {
				id,
			},
		});
		if (!upload) {
			ctx.status = 404;
			ctx.body = {
				error: "Upload not found",
			};
			return;
		}
		if (upload.ownerUid !== user.firebaseUid) {
			ctx.status = 403;
			ctx.body = {
				error: "Forbidden",
			};
			return;
		}
		await ctx.prisma.upload.delete({
			where: {
				id,
			},
		});
		ctx.status = 204;
	}
);

export default uploadsRouter;
