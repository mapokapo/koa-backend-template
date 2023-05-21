import { z } from "zod";

const configSchema = z.object({
	PORT: z.coerce.number().default(5000),
});

export type Config = z.infer<typeof configSchema>;

export default configSchema;
