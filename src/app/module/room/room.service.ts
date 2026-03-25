/* eslint-disable @typescript-eslint/no-explicit-any */
import { status } from "http-status";
import { Prisma, Room } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateRoomPayload, IUpdateRoomPayload } from "./room.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { roomFilterableFields, roomSearchableFields } from "./room.constant";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";

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

const createRoom = async (payload: ICreateRoomPayload): Promise<any> => {
  const { amenityIds = [], extraServiceIds = [], ...roomData } = payload;

  const uniqueAmenityIds = [...new Set(amenityIds)];
  const uniqueExtraServiceIds = [...new Set(extraServiceIds)];

  // 🔥 category check
  const categoryExists = await prisma.roomCategory.findUnique({
    where: { id: roomData.categoryId },
  });

  if (!categoryExists) {
    throw new AppError(status.NOT_FOUND, "Room category not found");
  }

  // 🔥 bedType check
  const bedTypeExists = await prisma.bedType.findUnique({
    where: { id: roomData.bedTypeId },
  });

  if (!bedTypeExists) {
    throw new AppError(status.NOT_FOUND, "Bed type not found");
  }

  // 🔥 admin check
  if (roomData.adminId) {
    const adminExists = await prisma.admin.findUnique({
      where: { id: roomData.adminId },
    });

    if (!adminExists) {
      throw new AppError(status.NOT_FOUND, "Admin not found");
    }
  }

  // 🔥 amenities check
  if (uniqueAmenityIds.length > 0) {
    const amenities = await prisma.amenity.findMany({
      where: { id: { in: uniqueAmenityIds } },
      select: { id: true },
    });

    if (amenities.length !== uniqueAmenityIds.length) {
      throw new AppError(status.BAD_REQUEST, "One or more amenities not found");
    }
  }

  // 🔥 extra services check
  if (uniqueExtraServiceIds.length > 0) {
    const services = await prisma.extraService.findMany({
      where: { id: { in: uniqueExtraServiceIds } },
      select: { id: true },
    });

    if (services.length !== uniqueExtraServiceIds.length) {
      throw new AppError(
        status.BAD_REQUEST,
        "One or more extra services not found",
      );
    }
  }

  // 🔥 transaction
  const result = await prisma.$transaction(async (tx) => {
    const createdRoom = await tx.room.create({
      data: {
        ...roomData,
        featuredImage: roomData.featuredImage || "",
        sliderImages: roomData.sliderImages || [],
        isEventSpace: roomData.isEventSpace ?? false,
        isFeatured: roomData.isFeatured ?? false,
        isActive: roomData.isActive ?? true,
        enableDynamicPricing: roomData.enableDynamicPricing ?? false,
      },
    });

    // 🔥 amenities relation
    if (uniqueAmenityIds.length > 0) {
      await tx.roomAmenity.createMany({
        data: uniqueAmenityIds.map((amenityId) => ({
          roomId: createdRoom.id,
          amenityId,
        })),
      });
    }

    // 🔥 extra services relation
    if (uniqueExtraServiceIds.length > 0) {
      await tx.roomExtraService.createMany({
        data: uniqueExtraServiceIds.map((extraServiceId) => ({
          roomId: createdRoom.id,
          extraServiceId,
        })),
      });
    }

    return await tx.room.findUnique({
      where: { id: createdRoom.id },
      include: roomIncludeConfig,
    });
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

const getSingleRoom = async (id: string): Promise<Room | null> => {
  const result = await prisma.room.findUnique({
    where: {
      id,
    },
    include: roomIncludeConfig,
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Room not found");
  }

  return result;
};

const updateRoom = async (
  id: string,
  payload: IUpdateRoomPayload
): Promise<Room> => {
  const existingRoom = await prisma.room.findUnique({
    where: { id },
  });

  if (!existingRoom) {
    throw new AppError(status.NOT_FOUND, "Room not found");
  }

  const {
    amenityIds,
    extraServiceIds,
    deletedSliderImages = [],
    removeFeaturedImage,
    sliderImages: newSliderImages = [],
    featuredImage: newFeaturedImage,
    ...roomData
  } = payload;

  if (roomData.categoryId) {
    const category = await prisma.roomCategory.findUnique({
      where: { id: roomData.categoryId },
    });

    if (!category) {
      throw new AppError(status.NOT_FOUND, "Room category not found");
    }
  }

  if (roomData.bedTypeId) {
    const bedType = await prisma.bedType.findUnique({
      where: { id: roomData.bedTypeId },
    });

    if (!bedType) {
      throw new AppError(status.NOT_FOUND, "Bed type not found");
    }
  }

  if (roomData.adminId) {
    const admin = await prisma.admin.findUnique({
      where: { id: roomData.adminId },
    });

    if (!admin) {
      throw new AppError(status.NOT_FOUND, "Admin not found");
    }
  }

  if (amenityIds) {
    const amenities = await prisma.amenity.findMany({
      where: {
        id: {
          in: amenityIds,
        },
      },
    });

    if (amenities.length !== [...new Set(amenityIds)].length) {
      throw new AppError(status.BAD_REQUEST, "One or more amenities not found");
    }
  }

  if (extraServiceIds) {
    const extraServices = await prisma.extraService.findMany({
      where: {
        id: {
          in: extraServiceIds,
        },
      },
    });

    if (extraServices.length !== [...new Set(extraServiceIds)].length) {
      throw new AppError(
        status.BAD_REQUEST,
        "One or more extra services not found"
      );
    }
  }

  // featured image logic
  let finalFeaturedImage = existingRoom.featuredImage;

  if (removeFeaturedImage) {
    if (existingRoom.featuredImage) {
      await deleteFileFromCloudinary(existingRoom.featuredImage);
    }
    finalFeaturedImage = null;
  }

  if (newFeaturedImage) {
    if (existingRoom.featuredImage) {
      await deleteFileFromCloudinary(existingRoom.featuredImage);
    }
    finalFeaturedImage = newFeaturedImage;
  }

  // slider image logic
  let finalSliderImages = existingRoom.sliderImages || [];

  if (deletedSliderImages.length > 0) {
    for (const imageUrl of deletedSliderImages) {
      await deleteFileFromCloudinary(imageUrl);
    }

    finalSliderImages = finalSliderImages.filter(
      (img) => !deletedSliderImages.includes(img)
    );
  }

  if (newSliderImages.length > 0) {
    finalSliderImages = [...finalSliderImages, ...newSliderImages];
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.room.update({
      where: { id },
      data: {
        ...roomData,
        featuredImage: finalFeaturedImage,
        sliderImages: finalSliderImages,
      },
    });

    if (amenityIds) {
      await tx.roomAmenity.deleteMany({
        where: {
          roomId: id,
        },
      });

      if (amenityIds.length > 0) {
        await tx.roomAmenity.createMany({
          data: [...new Set(amenityIds)].map((amenityId) => ({
            roomId: id,
            amenityId,
          })),
        });
      }
    }

    if (extraServiceIds) {
      await tx.roomExtraService.deleteMany({
        where: {
          roomId: id,
        },
      });

      if (extraServiceIds.length > 0) {
        await tx.roomExtraService.createMany({
          data: [...new Set(extraServiceIds)].map((extraServiceId) => ({
            roomId: id,
            extraServiceId,
          })),
        });
      }
    }

    const updatedRoom = await tx.room.findUniqueOrThrow({
      where: { id },
      include: roomIncludeConfig,
    });

    return updatedRoom;
  });

  return result;
};

const deleteRoom = async (id: string): Promise<Room> => {
  const existingRoom = await prisma.room.findUnique({
    where: {
      id,
    },
    include: {
      bookings: true,
      reviews: true,
      amenities: true,
      extraServices: true,
    },
  });

  if (!existingRoom) {
    throw new AppError(status.NOT_FOUND, "Room not found");
  }

  if (existingRoom.bookings.length > 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "This room has bookings and cannot be deleted",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.roomAmenity.deleteMany({
      where: {
        roomId: id,
      },
    });

    await tx.roomExtraService.deleteMany({
      where: {
        roomId: id,
      },
    });

    await tx.review.deleteMany({
      where: {
        roomId: id,
      },
    });

    const deletedRoom = await tx.room.delete({
      where: {
        id,
      },
      include: roomIncludeConfig,
    });

    return deletedRoom;
  });

  return result;
};

export const RoomService = {
  createRoom,
  getAllRooms,
  getSingleRoom,
  updateRoom,
  deleteRoom,
};
