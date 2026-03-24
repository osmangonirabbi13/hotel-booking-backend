import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateAdminPayload } from "./user.interface";

/* eslint-disable @typescript-eslint/no-explicit-any */
const createAdmin = async (payload: ICreateAdminPayload) => {
  // Step 1: Check if user already exists
  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.admin.email,
    },
  });

  if (userExists) {
    throw new AppError(status.CONFLICT, "User with this email already exists");
  }

  const { admin, role, password } = payload;
  // Step 2: Create user account with Better Auth
  const userData = await auth.api.signUpEmail({
    body: {
      ...admin,
      password,
      role,
      needPasswordChange: true,
    },
  });

  try {
    const adminData = await prisma.admin.create({
      data: {
        userId: userData.user.id,
        ...admin,
      },
    });
    return adminData;
  } catch (error: any) {
    console.log("Error creating admin: ", error);
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      },
    });
    throw error;
  }
};

export const UserService = {
  
  createAdmin,
};