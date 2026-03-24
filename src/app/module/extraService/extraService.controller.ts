import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { ExtraServiceService } from "./extraService.service";
import { Request, Response } from "express";
import { sendResponse } from "../../shared/sendResponse";

const createExtraService = catchAsync(async (req: Request, res: Response) => {
  const result = await ExtraServiceService.createExtraService(req.body);

  sendResponse(res, {
     httpStatusCode: status.CREATED,
    success: true,
    message: "Extra service created successfully",
    data: result,
  });
});


const getAllExtraServices = catchAsync(
  async (_req: Request, res: Response) => {
    const result = await ExtraServiceService.getAllExtraServices();

    sendResponse(res, {
       httpStatusCode: status.OK,
      success: true,
      message: "Extra services retrieved successfully",
      data: result,
    });
  }
);



const updateExtraService = catchAsync(async (req: Request, res: Response) => {
  const result = await ExtraServiceService.updateExtraService(
    req.params.id as string,
    req.body
  );

  sendResponse(res, {
     httpStatusCode: status.OK,
    success: true,
    message: "Extra service updated successfully",
    data: result,
  });
});

const deleteExtraService = catchAsync(async (req: Request, res: Response) => {
  const result = await ExtraServiceService.deleteExtraService(req.params.id     as string);

  sendResponse(res, {
     httpStatusCode: status.OK,
    success: true,
    message: "Extra service deleted successfully",
    data: result,
  });
});

export const ExtraServiceController = {
  createExtraService,
    getAllExtraServices,
    updateExtraService,
    deleteExtraService,
};