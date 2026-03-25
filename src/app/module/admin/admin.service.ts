import status from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";

import { prisma } from "../../lib/prisma";
import { IChangeUserRolePayload, IChangeUserStatusPayload } from "./admin.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const getAllAdmins = async () => {
  const admins = await prisma.admin.findMany({
    include: {
      user: true,
    },
  });
  return admins;
};

const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });
  return admin;
};


const changeUserStatus = async (
  user: IRequestUser,
  payload: IChangeUserStatusPayload,
) => {
  
  const isAdminExists = await prisma.admin.findUniqueOrThrow({
    where: {
      email: user.email,
    },
    include: {
      user: true,
    },
  });

  const { userId, userStatus } = payload;

  const userToChangeStatus = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const selfStatusChange = isAdminExists.userId === userId;

  if (selfStatusChange) {
    throw new AppError(status.BAD_REQUEST, "You cannot change your own status");
  }

  if (
    isAdminExists.user.role === Role.ADMIN &&
    userToChangeStatus.role === Role.ADMIN
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change the status of super admin. Only super admin can change the status of another super admin",
    );
  }

  if (
    isAdminExists.user.role === Role.ADMIN &&
    userToChangeStatus.role === Role.ADMIN
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change the status of another admin. Only super admin can change the status of another admin",
    );
  }

  if (userStatus === UserStatus.DELETED) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot set user status to deleted. To delete a user, you have to use role specific delete api. For example, to delete an doctor user, you have to use delete doctor api which will set the user status to deleted and also set isDeleted to true and also delete the user session and account",
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: userStatus,
    },
  });

  return updatedUser;
};

const changeUserRole = async (
  user: IRequestUser,
  payload: IChangeUserRolePayload,
) => {
  // 1. Super admin can change the role of only other super admin and admin user. He cannot change his own role.

  // 2. Admin cannot change role of any user

  // 3. Role of Patient and Doctor user cannot be changed by anyone. If needed, they have to be deleted and recreated with new role.

  const isAdminExists = await prisma.admin.findFirstOrThrow({
    where: {
      email: user.email,
      user: {
        role: Role.ADMIN,
      },
    },
    include: {
      user: true,
    },
  });

  const { userId, role } = payload;

  const userToChangeRole = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const selfRoleChange = isAdminExists.userId === userId;

  if (selfRoleChange) {
    throw new AppError(status.BAD_REQUEST, "You cannot change your own role");
  }

  if (
    userToChangeRole.role === Role.CUSTOMER 
   
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change the role of customer user. If you want to change the role of customer user, you have to delete the user and recreate with new role",
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
  });

  return updatedUser;
};
export const AdminService = {
  getAllAdmins,
  getAdminById,
  changeUserStatus,
  changeUserRole,
};
