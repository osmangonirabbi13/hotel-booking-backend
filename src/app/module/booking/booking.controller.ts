
import status from "http-status";
import { BookingService } from "./booking.service";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";


const bookBooking = catchAsync(async (req :Request, res : Response) => {
  const result = await BookingService.bookBooking(req.body, req.user);

  sendResponse(res, {
     httpStatusCode: status.OK,
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});


const initiateBookingPayment = catchAsync(async (req, res) => {
  const result = await BookingService.initiateBookingPayment(
    req.params.id as string ,
    req.user,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req, res) => {
  const result = await BookingService.getMyBookings(req.user, req.query);

  sendResponse(res, {
     httpStatusCode: status.OK,
    success: true,
    message: "My bookings fetched successfully",
    data: result,
  });
});

const getMySingleBooking = catchAsync(async (req, res) => {
  const result = await BookingService.getMySingleBooking(
    req.params.id as string,
    req.user,
  );

  sendResponse(res, {
     httpStatusCode: status.OK,
    success: true,
    message: "Booking fetched successfully",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req, res) => {
  const result = await BookingService.getAllBookings( req.query);

  sendResponse(res, {
     httpStatusCode: status.OK,
    success: true,
    message: "All bookings fetched successfully",
    data: result,
  });
});

const changeBookingStatus = catchAsync(async (req, res) => {
  const result = await BookingService.changeBookingStatus(
    req.params.id as string,
    req.body.status,
    req.user,
  );

  sendResponse(res, {
     httpStatusCode: status.OK,
    success: true,
    message: "Booking status updated successfully",
    data: result,
  });
});

export const BookingController = {
  bookBooking,
  
  initiateBookingPayment,
  getMyBookings,
  getMySingleBooking,
  getAllBookings,
  changeBookingStatus,
};