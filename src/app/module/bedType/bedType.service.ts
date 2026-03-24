import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateBedType, IUpdateBedType } from "./bedType.interface";
import { BedType } from "../../../generated/prisma/client";

const createBedType = async (
  payload: ICreateBedType,
): Promise<ICreateBedType> => {
  const existing = await prisma.bedType.findUnique({
    where: {
      name: payload.name,
    },
  });

  if (existing) {
    throw new AppError(
      status.BAD_REQUEST,
      `"${payload.name}" bed type already exists`,
    );
  }

  const result = await prisma.bedType.create({
    data: {
      name: payload.name,
    },
  });

  return result;
};

const getAllBedTypes = async (): Promise<BedType[]> => {
  const result = await prisma.bedType.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const updateBedType = async (
  id: string,
  payload: IUpdateBedType,
): Promise<BedType> => {
  const existing = await prisma.bedType.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Bed type not found");
  }

  if (payload.name) {
    const duplicateName = await prisma.bedType.findUnique({
      where: {
        name: payload.name,
      },
    });

    if (duplicateName && duplicateName.id !== id) {
      throw new AppError(
        status.BAD_REQUEST,
        `"${payload.name}" bed type already exists`,
      );
    }
  }

  const result = await prisma.bedType.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteBedType = async (id: string): Promise<BedType> => {
  const existing = await prisma.bedType.findUnique({
    where: {
      id,
    },
    include: {
      rooms: true,
    },
  });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Bed type not found");
  }

  if (existing.rooms.length > 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "This bed type is already assigned to rooms and cannot be deleted",
    );
  }

  const result = await prisma.bedType.delete({
    where: {
      id,
    },
  });

  return result;
};

export const BedTypeService = {
  createBedType,
  getAllBedTypes,
  updateBedType,
  deleteBedType,
};
