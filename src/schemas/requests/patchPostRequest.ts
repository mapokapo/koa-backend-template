import { z } from "zod";

const patchPostRequestSchema = z.object({
	title: z.string().optional(),
	content: z.string().optional(),
});

export type PatchPostRequest = z.infer<typeof patchPostRequestSchema>;

export default patchPostRequestSchema;
