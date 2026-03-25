import { Role } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedAdmin = async () => {
  try {
    const isSuperAdminExist = await prisma.user.findFirst({
      where: {
        role: Role.ADMIN,
      },
    });

    if (isSuperAdminExist) {
      console.log(" admin already exists. Skipping seeding super admin.");
      return;
    }

    const AdminUser = await auth.api.signUpEmail({
      body: {
        email: envVars.ADMIN_EMAIL,
        password: envVars.ADMIN_PASSWORD,
        name: "Admin",
        role: Role.ADMIN,
        needPasswordChange: false,
        rememberMe: false,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: AdminUser.user.id,
        },
        data: {
          emailVerified: true,
        },
      });

      await tx.admin.create({
        data: {
          userId: AdminUser.user.id,
          name: "Admin",
          email: envVars.ADMIN_EMAIL,
        },
      });
    });

    const Admin = await prisma.admin.findFirst({
      where: {
        email: envVars.ADMIN_EMAIL,
      },
      include: {
        user: true,
      },
    });

    console.log(" Admin Created ", Admin);
  } catch (error) {
    console.error("Error seeding  admin: ", error);
    await prisma.user.delete({
      where: {
        email: envVars.ADMIN_EMAIL,
      },
    });
  }
};
