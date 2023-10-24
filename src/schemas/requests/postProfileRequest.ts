import { z } from "zod";

const postProfileRequestSchema = z.object({
	name: z.string(),
	email: z.string(),
	imageUrl: z.string().optional(),
});

export type PostProfileRequest = z.infer<typeof postProfileRequestSchema>;

export default postProfileRequestSchema;
