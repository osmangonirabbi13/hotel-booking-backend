import { z } from "zod";

export const createRoomCategorySchema = z.object({
  name: z.string("Name is required").min(1),
  isActive: z.boolean().optional().default(true),
});

export const updateRoomCategorySchema = z.object({
  name: z.string().min(1).optional(),
  name_en: z.string().optional(),
  name_bn: z.string().optional(),
  name_ar: z.string().optional(),
  status: z.boolean().optional(),
});

export type CreateRoomCategoryInput = z.infer<typeof createRoomCategorySchema>;
export type UpdateRoomCategoryInput = z.infer<
  typeof updateRoomCategorySchema
>;
