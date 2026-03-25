import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { RoomService } from "./room.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";

const createRoom = catchAsync(async (req : Request, res : Response) => {
  const result = await RoomService.createRoom(req.body);

  sendResponse(res, {
     httpStatusCode: status.CREATED,
    success: true,
    message: "Room created successfully",
    data: result,
  });
});


const getAllRooms = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.getAllRooms(req.query as IQueryParams);

  sendResponse(res, {
     httpStatusCode: status.OK,
    success: true,
    message: "Rooms retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleRoom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await RoomService.getSingleRoom(id as string);

  sendResponse(res, {
     httpStatusCode: status.OK,
    success: true,
    message: "Room retrieved successfully",
    data: result,
  });
});

const updateRoom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await RoomService.updateRoom(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Room updated successfully",
    data: result,
  });
});

const deleteRoom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await RoomService.deleteRoom(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Room deleted successfully",
    data: result,
  });
});

export const RoomController = {
  createRoom,
    getAllRooms,
    getSingleRoom,
    updateRoom,
    deleteRoom,
};