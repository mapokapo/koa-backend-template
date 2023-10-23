import { z } from "zod";

const firebaseUidPathParamSchema = z.string();

export type FirebaseUidPathParam = z.infer<typeof firebaseUidPathParamSchema>;

export default firebaseUidPathParamSchema;
