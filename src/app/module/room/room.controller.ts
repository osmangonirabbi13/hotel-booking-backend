import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { RoomService } from "./room.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { ICreateRoomPayload } from "./room.interface";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";

const createRoom = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  const payload: ICreateRoomPayload = req.body;

  let featuredImageUrl = "";
  let sliderImageUrls: string[] = [];

  if (files?.featuredImage?.[0]) {
    const uploadedFeaturedImage = await uploadFileToCloudinary(
      files.featuredImage[0].buffer,
      files.featuredImage[0].originalname,
    );

    featuredImageUrl = uploadedFeaturedImage.secure_url;
  }

  if (files?.sliderImages?.length) {
    const uploadedSliderImages = await Promise.all(
      files.sliderImages.map((file) =>
        uploadFileToCloudinary(file.buffer, file.originalname),
      ),
    );

    sliderImageUrls = uploadedSliderImages.map((img) => img.secure_url);
  }

  payload.featuredImage = featuredImageUrl;
  payload.sliderImages = sliderImageUrls;

  payload.rent = Number(payload.rent);
  payload.totalUnits = Number(payload.totalUnits);
  payload.numberOfBaths = Number(payload.numberOfBaths);
  payload.maxGuests = Number(payload.maxGuests);

  if (payload.roomSize !== undefined) {
    payload.roomSize = Number(payload.roomSize);
  }

  if (payload.maxAdults !== undefined) {
    payload.maxAdults = Number(payload.maxAdults);
  }

  if (payload.maxChildren !== undefined) {
    payload.maxChildren = Number(payload.maxChildren);
  }

  const parseBoolean = (value: unknown): boolean => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value === "true";
    return false;
  };

  payload.isEventSpace = parseBoolean(payload.isEventSpace);
  payload.isFeatured = parseBoolean(payload.isFeatured);
  payload.enableDynamicPricing = parseBoolean(payload.enableDynamicPricing);

  payload.isActive =
    payload.isActive === undefined ? true : parseBoolean(payload.isActive);

  const result = await RoomService.createRoom(payload);

  sendResponse(res, {
    success: true,
    httpStatusCode: status.CREATED,
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
