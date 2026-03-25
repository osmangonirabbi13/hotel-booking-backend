import { Request, Response } from "express";
import status from "http-status";

import { CustomerService } from "./customer.service";
import { catchAsync } from "../../shared/catchAsync";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { sendResponse } from "../../shared/sendResponse";

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const payload = req.body;

  const result = await CustomerService.updateMyProfile(user, payload);

  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Profile updated successfully",
    data: result,
  });
});

export const CustomerController = {
  updateMyProfile,
};