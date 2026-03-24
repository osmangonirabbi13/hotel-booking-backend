import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { RoomCategoryService } from "./roomCategory.service";
import { sendResponse } from "../../shared/sendResponse";
import httpStatus from "http-status";

const createRoomCategory = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await RoomCategoryService.createRoomCategory(payload);

  sendResponse(res, {
    httpStatusCode: httpStatus.CREATED,
    success: true,
    message: "Room category created successfully",
    data: result,
  });
});

const getAllRoomCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomCategoryService.getAllRoomCategories();

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Room categories retrieved successfully",
    data: result,
  });
});

const updateRoomCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomCategoryService.updateRoomCategory(
    req.params.id as string,
    req.body
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Room category updated successfully",
    data: result,
  });
});

export const RoomCategoryController = {
  createRoomCategory,
  getAllRoomCategories,
  updateRoomCategory,
};
