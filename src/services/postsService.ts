import { Profile } from "@prisma/client";
import { KoaAppContext } from "../app.js";
import { PostPostRequest } from "../schemas/requests/postPostRequest.js";
import { PatchPostRequest } from "../schemas/requests/patchPostRequest.js";

const postsService = {
	getAllPosts: async (ctx: KoaAppContext) => {
		return await ctx.prisma.post.findMany();
	},
	getPostById: async (ctx: KoaAppContext, id: number) => {
		return await ctx.prisma.post.findUnique({
			where: {
				id,
			},
		});
	},
	createPost: async (
		ctx: KoaAppContext,
		user: Profile,
		data: PostPostRequest
	) => {
		return await ctx.prisma.post.create({
			data: {
				title: data.title,
				content: data.content,
				author: {
					connect: {
						firebaseUid: user.firebaseUid,
					},
				},
			},
		});
	},
	updatePost: async (
		ctx: KoaAppContext,
		id: number,
		data: PatchPostRequest
	) => {
		return await ctx.prisma.post.update({
			where: {
				id,
			},
			data: {
				title: data.title,
				content: data.content,
			},
		});
	},
	deletePost: async (ctx: KoaAppContext, id: number) => {
		return await ctx.prisma.post.delete({
			where: {
				id,
			},
		});
	},
};

export default postsService;
