import { KoaAppContext } from "../app.js";
import { PatchProfileRequest } from "../schemas/requests/patchProfileRequest.js";
import { PostProfileRequest } from "../schemas/requests/createProfileRequest.js";

const profilesService = {
	getProfileByFirebaseUid: async (ctx: KoaAppContext, firebaseUid: string) => {
		return await ctx.prisma.profile.findUnique({
			where: {
				firebaseUid,
			},
		});
	},
	createProfile: async (ctx: KoaAppContext, data: PostProfileRequest) => {
		return await ctx.prisma.profile.create({
			data: {
				firebaseUid: data.firebaseUid,
				name: data.name,
				email: data.email,
				imageUrl: data.imageUrl,
			},
		});
	},
	updateProfile: async (
		ctx: KoaAppContext,
		firebaseUid: string,
		data: PatchProfileRequest
	) => {
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
};

export default profilesService;
