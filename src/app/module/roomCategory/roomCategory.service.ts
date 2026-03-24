import { RoomCategory } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createRoomCategory = async (
  payload: RoomCategory,
): Promise<RoomCategory> => {

  const existing = await prisma.roomCategory.findUnique({
    where: {
      name: payload.name,
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


const getAllRoomCategories = async () => {
  return prisma.roomCategory.findMany({
    orderBy: { name: "asc" },
  });
};



export const RoomCategoryService = {
  createRoomCategory,
  getAllRoomCategories,
};
