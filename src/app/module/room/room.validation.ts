import { z } from "zod";

const createRoomZodSchema = z.object({
  
    rent: z.number("Rent is required").positive("Rent must be greater than 0"),

    totalUnits: z
      .number("Total units is required")
      .int("Total units must be an integer")
      .positive("Total units must be greater than 0"),

    roomSize: z
      .number()
      .positive("Room size must be greater than 0")
      .optional(),

    numberOfBaths: z
      .number("Number of baths is required")
      .int("Number of baths must be an integer")
      .min(1, "Number of baths must be at least 1"),

    maxGuests: z
      .number("Max guests is required")
      .int("Max guests must be an integer")
      .min(1, "Max guests must be at least 1"),

    maxAdults: z
      .number()
      .int("Max adults must be an integer")
      .min(0)
      .optional(),
    maxChildren: z
      .number()
      .int("Max children must be an integer")
      .min(0)
      .optional(),

    categoryId: z
      .string("Category ID is required")
      .min(1, "Category ID is required"),

    bedTypeId: z
      .string("Bed type ID is required")
      .min(1, "Bed type ID is required"),

    isEventSpace: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    enableDynamicPricing: z.boolean().optional(),

    featuredImage: z
      .string()
      .url("Featured image must be a valid URL")
      .optional(),

    sliderImages: z
      .array(z.string().url("Each slider image must be a valid URL"))
      .default([]),

    roomTitle: z.string().trim().min(2).max(200).optional(),
    featuredTitle: z.string().trim().min(2).max(200).optional(),
    description: z.string().trim().optional(),

    seoTitle: z.string().trim().max(200).optional(),
    seoDescription: z.string().trim().optional(),

    adminId: z.string().optional(),

    amenityIds: z.array(z.string()).optional(),
    extraServiceIds: z.array(z.string()).optional(),
  
});

const updateRoomZodSchema = z.object({
  rent: z.number().positive("Rent must be greater than 0").optional(),
  totalUnits: z
    .number()
    .int("Total units must be an integer")
    .positive("Total units must be greater than 0")
    .optional(),
  roomSize: z.number().positive("Room size must be greater than 0").optional(),
  numberOfBaths: z
    .number()
    .int("Number of baths must be an integer")
    .min(1, "Number of baths must be at least 1")
    .optional(),
  maxGuests: z
    .number()
    .int("Max guests must be an integer")
    .min(1, "Max guests must be at least 1")
    .optional(),
  maxAdults: z.number().int("Max adults must be an integer").min(0).optional(),
  maxChildren: z
    .number()
    .int("Max children must be an integer")
    .min(0)
    .optional(),

  categoryId: z.string().optional(),
  bedTypeId: z.string().optional(),

  isEventSpace: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  enableDynamicPricing: z.boolean().optional(),

  featuredImage: z
    .string()
    .url("Featured image must be a valid URL")
    .optional(),

  sliderImages: z
    .array(z.string().url("Each slider image must be a valid URL"))
    .optional(),

  roomTitle: z.string().trim().min(2).max(200).optional(),
  featuredTitle: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().optional(),

  seoTitle: z.string().trim().max(200).optional(),
  seoDescription: z.string().trim().optional(),

  adminId: z.union([z.string(), z.null()]).optional(),

  amenityIds: z.array(z.string()).optional(),
  extraServiceIds: z.array(z.string()).optional(),
});

export const RoomValidation = {
  createRoomZodSchema,
  updateRoomZodSchema,
};
