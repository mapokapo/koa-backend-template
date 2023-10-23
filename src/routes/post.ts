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
	const posts = await postsService.getAllPosts(ctx);

	ctx.body = posts;
});
postsRouter.get("/:id", async ctx => {
	const id = idPathParamSchema.parse(ctx.params["id"]);

	const post = await postsService.getPostById(ctx, id);

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
	const user = ctx.state.user;

	const body = postPostRequestSchema.parse(ctx.request.body);

	const post = await postsService.createPost(ctx, user, body);

	ctx.status = 201;
	ctx.body = post;
});
postsRouter.patch("/:id", authGuard(), async ctx => {
	const user = ctx.state.user;

	const id = idPathParamSchema.parse(ctx.params["id"]);

	const body = patchPostRequestSchema.parse(ctx.request.body);

	const post = await postsService.getPostById(ctx, id);

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
	const updatedPost = await postsService.updatePost(ctx, id, body);

	ctx.body = updatedPost;
});
postsRouter.delete("/:id", authGuard(), async ctx => {
	const user = ctx.state.user;

	const id = idPathParamSchema.parse(ctx.params["id"]);

	const post = await postsService.getPostById(ctx, id);

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

	await postsService.deletePost(ctx, id);

	ctx.status = 204;
});

export default postsRouter;
