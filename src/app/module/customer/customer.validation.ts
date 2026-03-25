import z from "zod";

const updateCustomerProfileZodSchema = z.object({
  customerInfo: z
    .object({
      name: z
        .string("Name must be a string")
        .min(1, "Name cannot be empty")
        .max(100, "Name must be less than 100 characters")
        .optional(),

      profilePhoto: z
        .url("Profile photo must be a valid URL")
        .optional(),

      contactNumber: z
        .string("Contact number must be a string")
        .min(1, "Contact number cannot be empty")
        .max(20, "Contact number must be less than 20 characters")
        .optional(),

      address: z
        .string("Address must be a string")
        .min(1, "Address cannot be empty")
        .max(200, "Address must be less than 200 characters")
        .optional(),
    })
    .optional(),
});

export const CustomerValidation = {
  updateCustomerProfileZodSchema,
};