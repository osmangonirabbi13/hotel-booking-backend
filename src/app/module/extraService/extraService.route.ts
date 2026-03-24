import express from "express";

import { ExtraServiceController } from "./extraService.controller";
import { ExtraServiceValidation } from "./extraService.validation";
import { validateRequest } from "../../middleware/validateRequest";

const router = express.Router();

router.post(
  "/",
  validateRequest(ExtraServiceValidation.createExtraServiceZodSchema),
  ExtraServiceController.createExtraService
);

router.get("/", ExtraServiceController.getAllExtraServices);

router.patch(
  "/:id",
  validateRequest(ExtraServiceValidation.updateExtraServiceZodSchema),
  ExtraServiceController.updateExtraService
);

router.delete("/:id", ExtraServiceController.deleteExtraService);

export const ExtraServiceRoutes = router;