import status from "http-status";
import { ExtraService } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateExtraService, IUpdateExtraService } from "./extraService.interface";

const createExtraService = async (
  payload: ICreateExtraService,
): Promise<ExtraService> => {
  const result = await prisma.extraService.create({
    data: {
      serviceName: payload.serviceName,
      serviceAmount: payload.serviceAmount,
      isActive: payload.isActive ?? true,
    },
  });

  return result;
};

const getAllExtraServices = async (): Promise<ExtraService[]> => {
  const result = await prisma.extraService.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};



const updateExtraService = async (
  id: string,
  payload: IUpdateExtraService,
): Promise<ExtraService> => {
  const existing = await prisma.extraService.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Extra service not found");
  }

  const result = await prisma.extraService.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteExtraService = async (id: string): Promise<ExtraService> => {
  const existing = await prisma.extraService.findUnique({
    where: {
      id,
    },
    include: {
      rooms: true,
    },
  });

  if (!existing) {
    throw new AppError(status.NOT_FOUND, "Extra service not found");
  }

  if (existing.rooms.length > 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "This extra service is already assigned to rooms and cannot be deleted",
    );
  }

  const result = await prisma.extraService.delete({
    where: {
      id,
    },
  });

  return result;
};

export const ExtraServiceService = {
  createExtraService,
    getAllExtraServices,
    updateExtraService,
    deleteExtraService,
};
