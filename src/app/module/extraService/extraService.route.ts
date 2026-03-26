import express from "express";

import { ExtraServiceController } from "./extraService.controller";
import { ExtraServiceValidation } from "./extraService.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.post(
  "/",
  validateRequest(ExtraServiceValidation.createExtraServiceZodSchema),
  checkAuth(Role.ADMIN),
  ExtraServiceController.createExtraService
);

router.get("/", checkAuth(Role.ADMIN), ExtraServiceController.getAllExtraServices);

router.patch(
  "/:id",
  validateRequest(ExtraServiceValidation.updateExtraServiceZodSchema),
  checkAuth(Role.ADMIN),
  ExtraServiceController.updateExtraService
);

router.delete("/:id", checkAuth(Role.ADMIN), ExtraServiceController.deleteExtraService);

export const ExtraServiceRoutes = router;