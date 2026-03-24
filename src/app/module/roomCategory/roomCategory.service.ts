import { RoomCategory } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { CreateRoomCategoryInput } from "./roomCategory.validation";

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

const updateRoomCategory = async (
  id: string,
  data: Partial<CreateRoomCategoryInput>
) => {
  const category = await prisma.roomCategory.findUnique({ where: { id } });
  if (!category) throw new Error("Room category not found");

  
  if (data.name && data.name !== category.name) {
    const duplicate = await prisma.roomCategory.findUnique({
      where: { name: data.name },
    });
    if (duplicate) throw new Error(`"${data.name}" name already exists`);
  }

  return prisma.roomCategory.update({ where: { id }, data });
};


export const RoomCategoryService = {
  createRoomCategory,
  getAllRoomCategories,
    updateRoomCategory,
};
