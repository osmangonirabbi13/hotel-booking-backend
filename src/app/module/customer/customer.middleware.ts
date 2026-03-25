import { NextFunction, Request, Response } from "express";
import {
  IUpdateCustomerInfoPayload,
  IUpdateCustomerProfilePayload,
} from "./customer.interface";

export const updateMyCustomerProfileMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
  }

  const payload: IUpdateCustomerProfilePayload = req.body;

  const files = req.files as {
    [fieldName: string]: Express.Multer.File[] | undefined;
  };

  if (files?.profilePhoto?.[0]) {
    if (!payload.customerInfo) {
      payload.customerInfo = {} as IUpdateCustomerInfoPayload;
    }

    payload.customerInfo.profilePhoto = files.profilePhoto[0].path;
  }

  req.body = payload;

  next();
};