

import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IUpdateCustomerProfilePayload } from "./customer.interface";

const updateMyProfile = async (
  user: IRequestUser,
  payload: IUpdateCustomerProfilePayload
) => {
  const customerData = await prisma.customer.findUniqueOrThrow({
    where: {
      email: user.email,
    },
    include: {
      user: true,
    },
  });

  await prisma.$transaction(async (tx) => {
    if (payload.customerInfo) {
      await tx.customer.update({
        where: {
          id: customerData.id,
        },
        data: {
          ...payload.customerInfo,
        },
      });

      if (
        payload.customerInfo.name ||
        payload.customerInfo.profilePhoto
      ) {
        const userData = {
          name: payload.customerInfo.name
            ? payload.customerInfo.name
            : customerData.name,
          image: payload.customerInfo.profilePhoto
            ? payload.customerInfo.profilePhoto
            : customerData.profilePhoto,
        };

        await tx.user.update({
          where: {
            id: customerData.userId,
          },
          data: {
            ...userData,
          },
        });
      }
    }
  });

  const result = await prisma.customer.findUnique({
    where: {
      id: customerData.id,
    },
    include: {
      user: true,
      reviews: true,
      bookings: true,
    },
  });

  return result;
};

export const CustomerService = {
  updateMyProfile,
};