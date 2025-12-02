import { z } from "zod";

// Block with no data
export const emptySchema = z.object({});

export type EmptyData = z.infer<typeof emptySchema>;

// No defaults needed — empty is enough
export const emptyDefaultData: EmptyData = {};
