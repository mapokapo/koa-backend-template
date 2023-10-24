import { Post } from "@prisma/client";
import { KoaAppContext } from "../app.js";
import { PostPostRequest } from "../schemas/requests/postPostRequest.js";
import { PatchPostRequest } from "../schemas/requests/patchPostRequest.js";
import Service from "../types/Service.js";

export interface PostsService
	extends Service<Post, PostPostRequest, PatchPostRequest, KoaAppContext> {}

const postsService: PostsService = {
	getAll: async ctx => {
		return await ctx.prisma.post.findMany();
	},
	getById: async (ctx, id) => {
		return await ctx.prisma.post.findUnique({
			where: {
				id,
			},
		});
	},
	create: async (ctx, firebaseUid, data) => {
		return await ctx.prisma.post.create({
			data: {
				title: data.title,
				content: data.content,
				author: {
					connect: {
						firebaseUid,
					},
				},
			},
		});
	},
	update: async (ctx, id, data) => {
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
	delete: async (ctx, id) => {
		return await ctx.prisma.post.delete({
			where: {
				id,
			},
		});
	},
};

export default postsService;
