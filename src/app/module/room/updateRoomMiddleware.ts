import { NextFunction, Request, Response } from "express";

export const updateRoomMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body?.data) {
      req.body = JSON.parse(req.body.data);
    }

    if (
      req.body?.amenityIds &&
      !Array.isArray(req.body.amenityIds)
    ) {
      req.body.amenityIds = JSON.parse(req.body.amenityIds);
    }

    if (
      req.body?.extraServiceIds &&
      !Array.isArray(req.body.extraServiceIds)
    ) {
      req.body.extraServiceIds = JSON.parse(req.body.extraServiceIds);
    }

    if (
      req.body?.deletedSliderImages &&
      !Array.isArray(req.body.deletedSliderImages)
    ) {
      req.body.deletedSliderImages = JSON.parse(req.body.deletedSliderImages);
    }

    if (typeof req.body?.removeFeaturedImage === "string") {
      req.body.removeFeaturedImage = req.body.removeFeaturedImage === "true";
    }

    next();
  } catch (error) {
    next(error);
  }
};