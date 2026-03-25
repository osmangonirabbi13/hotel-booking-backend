/* eslint-disable @typescript-eslint/no-explicit-any */
import  { status } from "http-status";
import { Prisma, Room } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateRoomPayload } from "./room.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { roomFilterableFields, roomSearchableFields } from "./room.constant";



const roomIncludeConfig: Prisma.RoomInclude = {
  category: true,
  bedType: true,
  admin: true,
  amenities: {
    include: {
      amenity: true,
    },
  },
  extraServices: {
    include: {
      extraService: true,
    },
  },
  bookings: true,
  reviews: true,
};

const createRoom = async (payload: ICreateRoomPayload): Promise<Room | any> => {
  const {
    amenityIds = [],
    extraServiceIds = [],
    ...roomData
  } = payload;

  const uniqueAmenityIds = [...new Set(amenityIds)];
  const uniqueExtraServiceIds = [...new Set(extraServiceIds)];

  
  const categoryExists = await prisma.roomCategory.findUnique({
    where: {
      id: roomData.categoryId,
    },
  });

  if (!categoryExists) {
    throw new AppError(status.NOT_FOUND, "Room category not found");
  }

 
  const bedTypeExists = await prisma.bedType.findUnique({
    where: {
      id: roomData.bedTypeId,
    },
  });

  if (!bedTypeExists) {
    throw new AppError(status.NOT_FOUND, "Bed type not found");
  }

 
  if (roomData.adminId) {
    const adminExists = await prisma.admin.findUnique({
      where: {
        id: roomData.adminId,
      },
    });

    if (!adminExists) {
      throw new AppError(status.NOT_FOUND, "Admin not found");
    }
  }

 
  if (uniqueAmenityIds.length > 0) {
    const amenities = await prisma.amenity.findMany({
      where: {
        id: {
          in: uniqueAmenityIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (amenities.length !== uniqueAmenityIds.length) {
      throw new AppError(
        status.BAD_REQUEST,
        "One or more amenities not found"
      );
    }
  }


  if (uniqueExtraServiceIds.length > 0) {
    const extraServices = await prisma.extraService.findMany({
      where: {
        id: {
          in: uniqueExtraServiceIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (extraServices.length !== uniqueExtraServiceIds.length) {
      throw new AppError(
        status.BAD_REQUEST,
        "One or more extra services not found"
      );
    }
  }


  const result = await prisma.$transaction(async (tx) => {
    const createdRoom = await tx.room.create({
      data: {
        ...roomData,
        sliderImages: roomData.sliderImages || [],
        isEventSpace: roomData.isEventSpace ?? false,
        isFeatured: roomData.isFeatured ?? false,
        isActive: roomData.isActive ?? true,
        enableDynamicPricing: roomData.enableDynamicPricing ?? false,
      },
    });

    if (uniqueAmenityIds.length > 0) {
      await tx.roomAmenity.createMany({
        data: uniqueAmenityIds.map((amenityId) => ({
          roomId: createdRoom.id,
          amenityId,
        })),
      });
    }

    if (uniqueExtraServiceIds.length > 0) {
      await tx.roomExtraService.createMany({
        data: uniqueExtraServiceIds.map((extraServiceId) => ({
          roomId: createdRoom.id,
          extraServiceId,
        })),
      });
    }

    const fullRoomData = await tx.room.findUnique({
      where: {
        id: createdRoom.id,
      },
      include: roomIncludeConfig,
    });

    return fullRoomData;
  });

  return result;
};


const getAllRooms = async (query: IQueryParams) => {
  const { checkIn, checkOut } = query;

  const queryBuilder = new QueryBuilder<
    Room,
    Prisma.RoomWhereInput,
    Prisma.RoomInclude
  >(prisma.room, query, {
    searchableFields: roomSearchableFields,
    filterableFields: roomFilterableFields,
  });

  const whereConditions: Prisma.RoomWhereInput = {
    isActive: true,
  };

  if (checkIn && checkOut) {
    whereConditions.bookings = {
      none: {
        AND: [
          {
            checkIn: {
              lt: new Date(checkOut as string),
            },
          },
          {
            checkOut: {
              gt: new Date(checkIn as string),
            },
          },
          {
            status: {
              in: ["CONFIRMED", "PENDING"],
            },
          },
        ],
      },
    };
  }

  const result = await queryBuilder
    .search()
    .filter()
    .where(whereConditions)
    .include({
      category: true,
      bedType: true,
      admin: true,
      amenities: {
        include: {
          amenity: true,
        },
      },
      extraServices: {
        include: {
          extraService: true,
        },
      },
    })
    .dynamicInclude(roomIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};


export const RoomService = {
  createRoom,
  getAllRooms
};