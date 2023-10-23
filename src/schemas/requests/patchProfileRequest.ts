import { z } from "zod";

const patchProfileRequestSchema = z.object({
	name: z.string().optional(),
	imageUrl: z.string().optional(),
});

export type PatchProfileRequest = z.infer<typeof patchProfileRequestSchema>;

export default patchProfileRequestSchema;
