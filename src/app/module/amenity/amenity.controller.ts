import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AmenityService } from "./amenity.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createAmenity = catchAsync(async (req: Request, res: Response) => {
  const result = await AmenityService.createAmenity(req.body);

  sendResponse(res, {
   httpStatusCode: status.CREATED,
    success: true,
    message: "Amenity created successfully",
    data: result,
  });
});

export const AmenityController = {
  createAmenity,
};