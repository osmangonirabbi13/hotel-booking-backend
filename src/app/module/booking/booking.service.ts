/* eslint-disable @typescript-eslint/no-explicit-any */
import { v7 as uuidv7 } from "uuid";
import status from "http-status";

import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import AppError from "../../errorHelpers/AppError";
import { envVars } from "../../config/env";

import {
  BookingStatus,
  PaymentStatus,
  Role,
} from "../../../generated/prisma/enums";

import { IBookBookingPayload } from "./booking.interface";
import { stripe } from "../../config/stripe.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Booking, Prisma } from "../../../generated/prisma/client";
import { bookingFilterableFields, bookingIncludeConfig, bookingSearchableFields } from "./booking.constant";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: date overlap check
// Overlap condition:  existing.checkIn  < newCheckOut
//                AND  existing.checkOut > newCheckIn
// ─────────────────────────────────────────────────────────────────────────────
const validateRoomAvailability = async (
  roomId: string,
  checkIn: Date,
  checkOut: Date,
) => {
  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      roomId,
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
      AND: [
        { checkIn:  { lt: checkOut } },
        { checkOut: { gt: checkIn  } },
      ],
    },
  });

  if (overlappingBooking) {
    throw new AppError(
      status.BAD_REQUEST,
      "This room is already booked for the selected date range",
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Book room + Pay Now
// ─────────────────────────────────────────────────────────────────────────────
const bookBooking = async (
  payload: IBookBookingPayload,
  user: IRequestUser,
) => {
  const customerData = await prisma.customer.findUniqueOrThrow({
    where: { email: user.email },
  });

  const roomData = await prisma.room.findUniqueOrThrow({
    where: { id: payload.roomId },
  });

  // FIX 1: Check room is active before allowing booking
  if (!roomData.isActive) {
    throw new AppError(status.BAD_REQUEST, "This room is not available for booking");
  }

  const checkIn  = new Date(payload.checkIn);
  const checkOut = new Date(payload.checkOut);

  if (checkIn >= checkOut) {
    throw new AppError(
      status.BAD_REQUEST,
      "Check-out date must be after check-in date",
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    throw new AppError(status.BAD_REQUEST, "Check-in date cannot be in the past");
  }

  await validateRoomAvailability(payload.roomId, checkIn, checkOut);

  const totalNights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (totalNights <= 0) {
    throw new AppError(status.BAD_REQUEST, "Invalid booking duration");
  }

  const totalPrice = totalNights * roomData.rent;

  // FIX 2: Stripe session must be created OUTSIDE the Prisma transaction.
  // Stripe is an external HTTP call — putting it inside a transaction can
  // cause timeouts and leave orphaned Stripe sessions if the DB rolls back.
  // Pattern: create DB records first → then create Stripe session.
  const { bookingData, paymentData } = await prisma.$transaction(async (tx) => {
    const bookingData = await tx.booking.create({
      data: {
        customerId:      customerData.id,
        roomId:          payload.roomId,
        checkIn,
        checkOut,
        guests:          payload.guests,
        specialRequests: payload.specialRequests,
        totalPrice,
        status:          BookingStatus.PENDING,
      },
      include: {
        room:     true,
        customer: true,
      },
    });

    const transactionId = String(uuidv7());

    const paymentData = await tx.payment.create({
      data: {
        bookingId:     bookingData.id,
        amount:        totalPrice,
        transactionId,
      },
    });

    return { bookingData, paymentData };
  });

  // FIX 3: null-safe room label — prevents "Room booking - null" on Stripe
  const roomLabel =
    roomData.roomTitle?.trim() ||
    `Room #${roomData.id.slice(-6).toUpperCase()}`;

  // FIX 4: currency "usd" — Stripe does not support BDT
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode:                 "payment",
    line_items: [
      {
        price_data: {
          currency:     "usd",
          product_data: { name: `Room Booking – ${roomLabel}` },
          unit_amount:  Math.round(totalPrice * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: bookingData.id,
      paymentId: paymentData.id,
    },
    success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success?booking_id=${bookingData.id}&payment_id=${paymentData.id}`,
    cancel_url:  `${envVars.FRONTEND_URL}/dashboard/my-bookings?error=payment_cancelled`,
  });

  return {
    booking:    bookingData,
    payment:    paymentData,
    paymentUrl: session.url,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Initiate payment for an existing PENDING booking
// ─────────────────────────────────────────────────────────────────────────────
const initiateBookingPayment = async (
  bookingId: string,
  user: IRequestUser,
) => {
  const customerData = await prisma.customer.findUniqueOrThrow({
    where: { email: user.email },
  });

  const bookingData = await prisma.booking.findFirst({
    where: {
      id:         bookingId,
      customerId: customerData.id,
    },
    include: {
      room:    true,
      payment: true,
    },
  });

  if (!bookingData) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  if (!bookingData.payment) {
    throw new AppError(status.NOT_FOUND, "Payment data not found");
  }

  if (bookingData.payment.status === PaymentStatus.PAID) {
    throw new AppError(status.BAD_REQUEST, "Payment already completed");
  }

  if (bookingData.status === BookingStatus.CANCELLED) {
    throw new AppError(status.BAD_REQUEST, "Booking is cancelled");
  }

  if (bookingData.status === BookingStatus.COMPLETED) {
    throw new AppError(status.BAD_REQUEST, "Booking is already completed");
  }

  // FIX 3: null-safe room label
  const roomLabel =
    bookingData.room.roomTitle?.trim() ||
    `Room #${bookingData.room.id.slice(-6).toUpperCase()}`;

  // FIX 4: currency "usd" — was "bdt" which Stripe does not support
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode:                 "payment",
    line_items: [
      {
        price_data: {
          currency:     "usd",
          product_data: { name: `Room Booking – ${roomLabel}` },
          unit_amount:  Math.round(bookingData.totalPrice * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: bookingData.id,
      paymentId: bookingData.payment.id,
    },
    success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success?booking_id=${bookingData.id}&payment_id=${bookingData.payment.id}`,
    cancel_url:  `${envVars.FRONTEND_URL}/dashboard/my-bookings?error=payment_cancelled`,
  });

  return { paymentUrl: session.url };
};

// ─────────────────────────────────────────────────────────────────────────────
// My bookings
// ─────────────────────────────────────────────────────────────────────────────
const getMyBookings = async (
  user: IRequestUser,
  query: Record<string, any>
) => {
  const customerData = await prisma.customer.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const queryBuilder = new QueryBuilder<
    Booking,
    Prisma.BookingWhereInput,
    Prisma.BookingInclude
  >(prisma.booking, query, {
    searchableFields: [],
    filterableFields: [],
  });

  const result = await queryBuilder
    .where({
      customerId: customerData.id,
    })
    .include({
      room: true,
      payment: true,
    })
    .paginate()
    .execute();

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// My single booking
// ─────────────────────────────────────────────────────────────────────────────
const getMySingleBooking = async (bookingId: string, user: IRequestUser) => {
  const customerData = await prisma.customer.findUniqueOrThrow({
    where: { email: user.email },
  });

  const booking = await prisma.booking.findFirst({
    where:   { id: bookingId, customerId: customerData.id },
    include: { room: true, payment: true, customer: true },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  return booking;
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin: all bookings
// ─────────────────────────────────────────────────────────────────────────────
const getAllBookings = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder<
    Booking,
    Prisma.BookingWhereInput,
    Prisma.BookingInclude
  >(prisma.booking, query, {
    searchableFields: bookingSearchableFields,
    filterableFields: bookingFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .include({
      customer: {
        include: {
          user: true,
        },
      },
      room: true,
      payment: true,
    })
    .dynamicInclude(bookingIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// Change booking status
// ─────────────────────────────────────────────────────────────────────────────
const changeBookingStatus = async (
  bookingId: string,
  bookingStatus: BookingStatus,
  user: IRequestUser,
) => {
  const bookingData = await prisma.booking.findUniqueOrThrow({
    where:   { id: bookingId },
    include: { customer: true, payment: true },
  });

  // Customer can only cancel their own booking
  if (user.role === Role.CUSTOMER) {
    if (bookingData.customer.email !== user.email) {
      throw new AppError(status.FORBIDDEN, "This is not your booking"); // FIX 5: 403 not 400
    }

    if (bookingStatus !== BookingStatus.CANCELLED) {
      throw new AppError(status.BAD_REQUEST, "Customers can only cancel bookings");
    }

    if (
      bookingData.status === BookingStatus.CANCELLED ||
      bookingData.status === BookingStatus.COMPLETED
    ) {
      throw new AppError(
        status.BAD_REQUEST,
        "Completed or cancelled booking cannot be updated",
      );
    }
  }

  // Admin / Super Admin can change to any status
  return prisma.booking.update({
    where: { id: bookingId },
    data:  { status: bookingStatus },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Auto-cancel unpaid bookings after 30 minutes  (called from a cron job)
// ─────────────────────────────────────────────────────────────────────────────
const cancelUnpaidBookings = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  // FIX 6: Also catch PENDING payment status —
  // users who never reached Stripe will have payment status PENDING forever.
  const unpaidBookings = await prisma.booking.findMany({
    where: {
      createdAt: { lte: thirtyMinutesAgo },
      status:    BookingStatus.PENDING,
      payment: {
        status: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] },
      },
    },
    select: { id: true },
  });

  const bookingIds = unpaidBookings.map((b) => b.id);
  if (!bookingIds.length) return;

  // FIX 7: updateMany instead of deleteMany — deleting destroys audit trail
  await prisma.$transaction(async (tx) => {
    await tx.booking.updateMany({
      where: { id: { in: bookingIds } },
      data:  { status: BookingStatus.CANCELLED },
    });

    await tx.payment.updateMany({
      where: { bookingId: { in: bookingIds } },
      data:  { status: PaymentStatus.FAILED },
    });
  });

  console.log(`✅ Auto-cancelled ${bookingIds.length} unpaid booking(s)`);
};

export const BookingService = {
  bookBooking,
  initiateBookingPayment,
  getMyBookings,
  getMySingleBooking,
  getAllBookings,
  changeBookingStatus,
  cancelUnpaidBookings,
};