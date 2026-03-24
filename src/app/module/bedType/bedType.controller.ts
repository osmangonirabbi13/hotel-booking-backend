import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { BedTypeService } from "./bedType.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createBedType = catchAsync(async (req: Request, res: Response) => {
  const result = await BedTypeService.createBedType(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Bed type created successfully",
    data: result,
  });
});

const getAllBedTypes = catchAsync(async (req: Request, res: Response) => {
  const result = await BedTypeService.getAllBedTypes();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Bed types retrieved successfully",
    data: result,
  });
})


const updateBedType = catchAsync(async (req: Request, res: Response) => {
  const result = await BedTypeService.updateBedType(req.params.id as string, req.body);

  sendResponse(res, {
     httpStatusCode: status.OK,
    success: true,
    message: "Bed type updated successfully",
    data: result,
  });
});

const deleteBedType = catchAsync(async (req: Request, res: Response) => {
  const result = await BedTypeService.deleteBedType(req.params.id as string);

  sendResponse(res, {
     httpStatusCode: status.OK,
    success: true,
    message: "Bed type deleted successfully",
    data: result,
  });
});

export const BedTypeController = {
  createBedType,
  getAllBedTypes,
  updateBedType,
  deleteBedType,
};
