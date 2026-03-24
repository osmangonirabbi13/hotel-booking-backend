import { z } from "zod";

const createAmenityZodSchema = z.object({

    title: z
      .string(
         "Amenity title is required",
      )
      .trim()
      .min(2, "Amenity title must be at least 2 characters")
      .max(100, "Amenity title cannot exceed 100 characters"),

    icon: z
      .string()
      .trim()
      .url("Icon must be a valid URL")
      .optional(),

    serialNumber: z
      .number(
        "Serial number is required",
      )
      .int("Serial number must be an integer")
      .positive("Serial number must be positive"),

});

const updateAmenityZodSchema = z.object({
  
    title: z
      .string()
      .trim()
      .min(2, "Amenity title must be at least 2 characters")
      .max(100, "Amenity title cannot exceed 100 characters")
      .optional(),

    icon: z
      .string()
      .trim()
      .url("Icon must be a valid URL")
      .optional(),

    serialNumber: z
      .number()
      .int("Serial number must be an integer")
      .positive("Serial number must be positive")
      .optional(),

});

export const AmenityValidation = {
  createAmenityZodSchema,
  updateAmenityZodSchema,
};