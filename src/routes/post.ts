import Router from "@koa/router";
import { z } from "zod";
import { KoaAppContext, KoaAppState } from "../app.js";
import authGuard from "../middleware/authGuard.js";
import { Profile } from "@prisma/client";

const postsRouter = new Router<KoaAppState, KoaAppContext>({
	prefix: "/posts",
});

postsRouter.get("/", async ctx => {
	const posts = await ctx.prisma.post.findMany();
	ctx.body = posts;
});
postsRouter.get("/:id", async ctx => {
	const id = z.coerce.number().parse(ctx.params["id"]);
	const post = await ctx.prisma.post.findUnique({
		where: {
			id,
		},
	});
	if (!post) {
		ctx.status = 404;
		ctx.body = {
			error: "Post not found",
		};
		return;
	}
	ctx.body = post;
});
postsRouter.post("/", authGuard({ requiresProfile: true }), async ctx => {
	const user = ctx.state.user as Profile;
	const body = z
		.object({
			title: z.string(),
			content: z.string(),
		})
		.parse(ctx.request.body);
	const post = await ctx.prisma.post.create({
		data: {
			title: body.title,
			content: body.content,
			author: {
				connect: {
					firebaseUid: user.firebaseUid,
				},
			},
		},
	});
	ctx.status = 201;
	ctx.body = post;
});
postsRouter.patch("/:id", authGuard({ requiresProfile: true }), async ctx => {
	const user = ctx.state.user as Profile;
	const id = z.coerce.number().parse(ctx.params["id"]);
	const post = await ctx.prisma.post.findUnique({
		where: {
			id,
		},
	});
	if (!post) {
		ctx.status = 404;
		ctx.body = {
			error: "Post not found",
		};
		return;
	}
	if (post.authorUid !== user.firebaseUid) {
		ctx.status = 403;
		ctx.body = {
			error: "Forbidden",
		};
		return;
	}
	const body = z
		.object({
			title: z.string().optional(),
			content: z.string().optional(),
		})
		.parse(ctx.request.body);
	const updatedPost = await ctx.prisma.post.update({
		where: {
			id,
		},
		data: {
			title: body.title,
			content: body.content,
		},
	});
	ctx.body = updatedPost;
});
postsRouter.delete("/:id", authGuard({ requiresProfile: true }), async ctx => {
	const user = ctx.state.user as Profile;
	const id = z.coerce.number().parse(ctx.params["id"]);
	const post = await ctx.prisma.post.findUnique({
		where: {
			id,
		},
	});
	if (!post) {
		ctx.status = 404;
		ctx.body = {
			error: "Post not found",
		};
		return;
	}
	if (post.authorUid !== user.firebaseUid) {
		ctx.status = 403;
		ctx.body = {
			error: "Forbidden",
		};
		return;
	}
	await ctx.prisma.post.delete({
		where: {
			id,
		},
	});
	ctx.status = 204;
});

export default postsRouter;
