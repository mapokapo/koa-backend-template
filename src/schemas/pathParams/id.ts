import { z } from "zod";

const idPathParamSchema = z.coerce.number();

export type IdPathParam = z.infer<typeof idPathParamSchema>;

export default idPathParamSchema;
