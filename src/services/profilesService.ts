import { KoaAppContext } from "../app.js";
import { PatchProfileRequest } from "../schemas/requests/patchProfileRequest.js";
import { PostProfileRequest } from "../schemas/requests/postProfileRequest.js";
import Service from "../types/Service.js";
import { Profile } from "@prisma/client";

export interface ProfileService
	extends Omit<
		Service<
			Profile,
			PostProfileRequest,
			PatchProfileRequest,
			KoaAppContext,
			string,
			string
		>,
		"create"
	> {
	create: (
		ctx: KoaAppContext,
		firebaseUid: string,
		data: PostProfileRequest
	) => Promise<Profile>;
	getByIdOrEmail: (
		ctx: KoaAppContext,
		firebaseUid: string,
		email: string
	) => Promise<Profile | null>;
}

const profilesService: ProfileService = {
	getById: async (ctx, firebaseUid) => {
		return await ctx.prisma.profile.findUnique({
			where: {
				firebaseUid,
			},
		});
	},
	getByIdOrEmail: async (ctx, firebaseUid, email) => {
		return await ctx.prisma.profile.findFirst({
			where: {
				OR: [
					{
						firebaseUid,
					},
					{
						email,
					},
				],
			},
		});
	},
	getAll: async ctx => {
		return await ctx.prisma.profile.findMany();
	},
	create: async (ctx, firebaseUid, data) => {
		return await ctx.prisma.profile.create({
			data: {
				firebaseUid,
				name: data.name,
				email: data.email,
				imageUrl: data.imageUrl,
			},
		});
	},
	update: async (ctx, firebaseUid, data) => {
		return await ctx.prisma.profile.update({
			where: {
				firebaseUid,
			},
			data: {
				name: data.name,
				imageUrl: data.imageUrl,
			},
		});
	},
	delete: async (ctx, firebaseUid) => {
		return await ctx.prisma.profile.delete({
			where: {
				firebaseUid,
			},
		});
	},
};

export default profilesService;
