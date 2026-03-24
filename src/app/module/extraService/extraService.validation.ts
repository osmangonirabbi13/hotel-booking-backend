import { z } from "zod";

const createExtraServiceZodSchema = z.object({
  serviceName: z
    .string("Service name is required")
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(100, "Service name cannot exceed 100 characters"),

  serviceAmount: z
    .number("Service amount is required")
    .positive("Service amount must be greater than 0"),

  isActive: z.boolean().optional(),
});

const updateExtraServiceZodSchema = z.object({
  serviceName: z
    .string()
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(100, "Service name cannot exceed 100 characters")
    .optional(),

  serviceAmount: z
    .number()
    .positive("Service amount must be greater than 0")
    .optional(),

  isActive: z.boolean().optional(),
});

export const ExtraServiceValidation = {
  createExtraServiceZodSchema,
  updateExtraServiceZodSchema,
};
