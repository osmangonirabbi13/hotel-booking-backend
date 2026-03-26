import express from "express";

import { Role } from "../../../generated/prisma/enums";
import { BookingController } from "./booking.controller";
import { checkAuth } from "../../middleware/checkAuth";

const router = express.Router();

router.post(
  "/",
  checkAuth(Role.CUSTOMER),
  BookingController.bookBooking,
);



router.post(
  "/initiate-payment/:id",
  checkAuth(Role.CUSTOMER),
  BookingController.initiateBookingPayment,
);

router.get(
  "/my-bookings",
  checkAuth(Role.CUSTOMER),
  BookingController.getMyBookings,
);

router.get(
  "/my-bookings/:id",
  checkAuth(Role.CUSTOMER),
  BookingController.getMySingleBooking,
);

router.get(
  "/",
  checkAuth(Role.ADMIN),
  BookingController.getAllBookings,
);

router.patch(
  "/:id/status",
  checkAuth(Role.CUSTOMER, Role.ADMIN),
  BookingController.changeBookingStatus,
);

export const BookingRoutes = router;