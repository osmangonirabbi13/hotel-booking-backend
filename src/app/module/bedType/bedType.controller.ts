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

export const BedTypeController = {
  createBedType,
};
