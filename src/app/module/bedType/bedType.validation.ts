import { z } from "zod";

const createBedTypeZodSchema = z.object({
  name: z
    .string("Bed type name is required")
    .trim()
    .min(2, "Bed type name must be at least 2 characters")
    .max(50, "Bed type name cannot exceed 50 characters"),
});

const updateBedTypeZodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Bed type name must be at least 2 characters")
    .max(50, "Bed type name cannot exceed 50 characters")
    .optional(),
});

export const BedTypeValidation = {
  createBedTypeZodSchema,
  updateBedTypeZodSchema,
};
