import { z } from "zod";

export const createRoomCategorySchema = z.object({
  name: z.string("Name is required").min(1),
  isActive: z.boolean().optional().default(true),
});
