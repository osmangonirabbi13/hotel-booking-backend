import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { Amenity } from "../../../generated/prisma/client";
import { ICreateAmenity } from "./amenity.interface";


const createAmenity = async (payload: ICreateAmenity): Promise<Amenity> => {
  const existingBySerial = await prisma.amenity.findUnique({
    where: {
      serialNumber: payload.serialNumber,
    },
  });

  if (existingBySerial) {
    throw new AppError(
      status.BAD_REQUEST,
      `Amenity with serial number "${payload.serialNumber}" already exists`
    );
  }

  const result = await prisma.amenity.create({
    data: {
      title: payload.title,
      icon: payload.icon,
      serialNumber: payload.serialNumber,
    },
  });

  return result;
};

export const AmenityService = {
  createAmenity,
};