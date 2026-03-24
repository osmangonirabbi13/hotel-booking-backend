import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { Amenity } from "../../../generated/prisma/client";
import { ICreateAmenity, IUpdateAmenity } from "./amenity.interface";


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

const getAllAmenities = async (): Promise<Amenity[]> => {
  const result = await prisma.amenity.findMany({
    orderBy: {
      serialNumber: "asc",
    },
  });

  return result;
};



const updateAmenity = async (
  id: string,
  payload: IUpdateAmenity
): Promise<Amenity> => {
  const existing = await prisma.amenity.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Amenity not found");
  }

  if (payload.serialNumber !== undefined) {
    const duplicateSerial = await prisma.amenity.findUnique({
      where: {
        serialNumber: payload.serialNumber,
      },
    });

    if (duplicateSerial && duplicateSerial.id !== id) {
      throw new AppError(
        status.BAD_REQUEST,
        `Amenity with serial number "${payload.serialNumber}" already exists`
      );
    }
  }

  const result = await prisma.amenity.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteAmenity = async (id: string): Promise<Amenity> => {
  const existing = await prisma.amenity.findUnique({
    where: {
      id,
    },
    include: {
      rooms: true,
    },
  });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Amenity not found");
  }

  if (existing.rooms.length > 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "This amenity is already assigned to rooms and cannot be deleted"
    );
  }

  const result = await prisma.amenity.delete({
    where: {
      id,
    },
  });

  return result;
};

export const AmenityService = {
  createAmenity,
    getAllAmenities,
    updateAmenity,
    deleteAmenity,
    
};