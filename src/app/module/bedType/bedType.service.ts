import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateBedType } from "./bedType.interface";

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

const getBedType = () => {};

const updateBedType = () => {};

const deleteBedType = () => {};

export const BedTypeService = {
  createBedType,
  getBedType,
  updateBedType,
  deleteBedType,
};
