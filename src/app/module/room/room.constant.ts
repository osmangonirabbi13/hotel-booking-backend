import { Prisma } from "../../../generated/prisma/client";

export const roomSearchableFields = [
  "roomTitle",
  "featuredTitle",
  "description",
  "seoTitle",
  "seoDescription",
  "category.name",
  "bedType.name",
  "amenities.amenity.title",
  "extraServices.extraService.serviceName",
];

export const roomFilterableFields = [
  "categoryId",
  "bedTypeId",
  "adminId",

  "isEventSpace",
  "isFeatured",
  "isActive",
  "enableDynamicPricing",

  "rent",
  "totalUnits",
  "roomSize",
  "numberOfBaths",
  "maxGuests",
  "maxAdults",
  "maxChildren",

  "category.name",
  "bedType.name",
  "amenities.amenityId",
  "amenities.amenity.title",
  "extraServices.extraServiceId",
  "extraServices.extraService.serviceName",
];

export const roomIncludeConfig: Partial<
  Record<keyof Prisma.RoomInclude, Prisma.RoomInclude[keyof Prisma.RoomInclude]>
> = {
  category: true,
  bedType: true,
  admin: true,

  amenities: {
    include: {
      amenity: true,
    },
  },

  extraServices: {
    include: {
      extraService: true,
    },
  },

  bookings: true,
  reviews: true,
};