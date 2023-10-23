import { z } from "zod";

const postProfileRequest = z.object({
	firebaseUid: z.string(),
	name: z.string(),
	email: z.string(),
	imageUrl: z.string().optional(),
});

export type PostProfileRequest = z.infer<typeof postProfileRequest>;

export default postProfileRequest;
