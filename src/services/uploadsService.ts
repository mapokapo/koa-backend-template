import multer from "@koa/multer";
import { KoaAppContext } from "../app.js";

const uploadsService = {
	getAllUploads: async (ctx: KoaAppContext, firebaseUid: string) => {
		return await ctx.prisma.upload.findMany({
			where: {
				ownerUid: firebaseUid,
			},
		});
	},
	getUploadById: async (ctx: KoaAppContext, id: number) => {
		return await ctx.prisma.upload.findUnique({
			where: {
				id,
			},
		});
	},
	createUpload: async (
		ctx: KoaAppContext,
		firebaseUid: string,
		file: multer.File
	) => {
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
	updateUpload: async (ctx: KoaAppContext, id: number, file: multer.File) => {
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
	deleteUpload: async (ctx: KoaAppContext, id: number) => {
		return await ctx.prisma.upload.delete({
			where: {
				id,
			},
		});
	},
};

export default uploadsService;
