import { z } from "zod";

export const legalTextSchema = z.object({
  text: z.string().max(2000, "Text is too long").optional(),
});

export type LegalTextData = z.infer<typeof legalTextSchema>;
