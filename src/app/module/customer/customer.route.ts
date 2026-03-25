import express from "express";
import { CustomerController } from "./customer.controller";

import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { updateMyCustomerProfileMiddleware } from "./customer.middleware";

import { CustomerValidation } from "./customer.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";

const router = express.Router();

router.patch(
  "/update-my-profile",
  checkAuth(Role.CUSTOMER),
  multerUpload.fields([{ name: "profilePhoto", maxCount: 1 }]),
  updateMyCustomerProfileMiddleware,
  validateRequest(CustomerValidation.updateCustomerProfileZodSchema),
  CustomerController.updateMyProfile
);

export const CustomerRoutes = router;