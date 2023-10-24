import Router from "@koa/router";
import { KoaAppContext, KoaAppState } from "../app.js";
import authGuard from "../middleware/authGuard.js";
import postsService from "../services/postsService.js";
import postPostRequestSchema from "../schemas/requests/postPostRequest.js";
import idPathParamSchema from "../schemas/pathParams/id.js";
import patchPostRequestSchema from "../schemas/requests/patchPostRequest.js";

const postsRouter = new Router<KoaAppState, KoaAppContext>({
	prefix: "/posts",
});

postsRouter.get("/", async ctx => {
	const posts = await postsService.getAll(ctx);

	ctx.body = posts;
});
postsRouter.get("/:id", async ctx => {
	const id = idPathParamSchema.parse(ctx.params["id"]);

	const post = await postsService.getById(ctx, id);

	if (!post) {
		ctx.status = 404;
		ctx.body = {
			error: "Post not found",
		};
		return;
	}

	ctx.body = post;
});
postsRouter.post("/", authGuard(), async ctx => {
	const body = postPostRequestSchema.parse(ctx.request.body);

	const post = await postsService.create(ctx, ctx.state.user.firebaseUid, body);

	ctx.status = 201;
	ctx.body = post;
});
postsRouter.patch("/:id", authGuard(), async ctx => {
	const id = idPathParamSchema.parse(ctx.params["id"]);

	const body = patchPostRequestSchema.parse(ctx.request.body);

	const post = await postsService.getById(ctx, id);

	if (!post) {
		ctx.status = 404;
		ctx.body = {
			error: "Post not found",
		};
		return;
	}

	if (post.authorUid !== ctx.state.user.firebaseUid) {
		ctx.status = 403;
		ctx.body = {
			error: "Forbidden",
		};
		return;
	}
	const updatedPost = await postsService.update(ctx, id, body);

	ctx.body = updatedPost;
});
postsRouter.delete("/:id", authGuard(), async ctx => {
	const id = idPathParamSchema.parse(ctx.params["id"]);

	const post = await postsService.getById(ctx, id);

	if (!post) {
		ctx.status = 404;
		ctx.body = {
			error: "Post not found",
		};
		return;
	}

	if (post.authorUid !== ctx.state.user.firebaseUid) {
		ctx.status = 403;
		ctx.body = {
			error: "Forbidden",
		};
		return;
	}

	await postsService.delete(ctx, id);

	ctx.status = 204;
});

export default postsRouter;
