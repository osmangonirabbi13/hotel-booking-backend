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

const getAllAmenities = catchAsync(async (_req: Request, res: Response) => {
  const result = await AmenityService.getAllAmenities();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Amenities retrieved successfully",
    data: result,
  });
});


const updateAmenity = catchAsync(async (req: Request, res: Response) => {
  const result = await AmenityService.updateAmenity(req.params.id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Amenity updated successfully",
    data: result,
  });
});

const deleteAmenity = catchAsync(async (req: Request, res: Response) => {
  const result = await AmenityService.deleteAmenity(req.params.id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Amenity deleted successfully",
    data: result,
  });
});

export const AmenityController = {
  createAmenity,
    getAllAmenities,
    updateAmenity,
    deleteAmenity,
};