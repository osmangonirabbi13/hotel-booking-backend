import { z } from "zod";


export const createRoomCategorySchema = z.object({
  body: z.object({
    name:    z.string("Name is required").min(1),
    status:  z.boolean().optional().default(true),
  }),
});