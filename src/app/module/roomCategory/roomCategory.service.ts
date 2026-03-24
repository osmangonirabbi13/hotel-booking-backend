import { RoomCategory } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createRoomCategory = async (
  payload: RoomCategory,
): Promise<RoomCategory> => {

  const existing = await prisma.roomCategory.findUnique({
    where: {
      name: payload.name
    }
  });

  if (existing) {
    throw new Error(`"${payload.name}" already exists. Please choose a different name.`);
  }

  const roomcategory = await prisma.roomCategory.create({
    data: payload,
  });

  return roomcategory;
};




export const RoomCategoryService = {
  createRoomCategory,
};
