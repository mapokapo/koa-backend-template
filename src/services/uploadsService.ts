import multer from "@koa/multer";
import { KoaAppContext } from "../app.js";
import Service from "../types/Service.js";
import { Upload } from "@prisma/client";

export interface UploadsService
	extends Service<Upload, multer.File, multer.File, KoaAppContext> {
	getAllForUser: (ctx: KoaAppContext, firebaseUid: string) => Promise<Upload[]>;
}

const uploadsService: UploadsService = {
	getAll: async ctx => {
		return await ctx.prisma.upload.findMany();
	},
	getAllForUser: async (ctx: KoaAppContext, firebaseUid: string) => {
		return await ctx.prisma.upload.findMany({
			where: {
				owner: {
					firebaseUid,
				},
			},
		});
	},
	getById: async (ctx, id) => {
		return await ctx.prisma.upload.findUnique({
			where: {
				id,
			},
		});
	},
	create: async (ctx, firebaseUid, file) => {
		return await ctx.prisma.upload.create({
			data: {
				fileName: file.filename,
				mimeType: file.mimetype,
				owner: {
					connect: {
						firebaseUid,
					},
				},
			},
		});
	},
	update: async (ctx, id, file) => {
		return await ctx.prisma.upload.update({
			where: {
				id,
			},
			data: {
				fileName: file.filename,
				mimeType: file.mimetype,
			},
		});
	},
	delete: async (ctx, id) => {
		return await ctx.prisma.upload.delete({
			where: {
				id,
			},
		});
	},
};

export default uploadsService;
