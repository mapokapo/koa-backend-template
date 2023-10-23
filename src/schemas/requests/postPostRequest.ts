import { z } from "zod";

const postPostRequestSchema = z.object({
	title: z.string(),
	content: z.string(),
});

export type PostPostRequest = z.infer<typeof postPostRequestSchema>;

export default postPostRequestSchema;
