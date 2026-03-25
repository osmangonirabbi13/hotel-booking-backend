import { NextFunction, Request, Response } from "express";

export const createRoomMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
  }

  const payload = req.body;

  if (payload.amenityIds && !Array.isArray(payload.amenityIds)) {
    payload.amenityIds = JSON.parse(payload.amenityIds);
  }

  if (payload.extraServiceIds && !Array.isArray(payload.extraServiceIds)) {
    payload.extraServiceIds = JSON.parse(payload.extraServiceIds);
  }

  req.body = payload;
  next();
};