import { Prisma } from "../../../generated/prisma/client";

export const bookingSearchableFields = [
  "specialRequests",
  "status",
  "customer.user.name",
  "customer.user.email",
  "room.roomTitle",
  "payment.transactionId",
  "payment.status",
];

export const bookingFilterableFields = [
  "customerId",
  "roomId",
  "status",
  "guests",
  "totalPrice",
  "checkIn",
  "checkOut",
  "createdAt",

  "customer.user.name",
  "customer.user.email",
  "room.roomTitle",
  "payment.status",
];

export const bookingIncludeConfig: Partial<
  Record<
    keyof Prisma.BookingInclude,
    Prisma.BookingInclude[keyof Prisma.BookingInclude]
  >
> = {
  customer: {
    include: {
      user: true,
    },
  },
  room: true,
  payment: true,
};