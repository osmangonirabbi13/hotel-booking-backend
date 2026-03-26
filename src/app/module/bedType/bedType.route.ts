import express from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { BedTypeValidation } from "./bedType.validation";
import { BedTypeController } from "./bedType.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";



const router = express.Router();

router.post(
  "/",
  validateRequest(BedTypeValidation.createBedTypeZodSchema),
  checkAuth(Role.ADMIN),
  BedTypeController.createBedType
);

router.get("/", checkAuth(Role.ADMIN), BedTypeController.getAllBedTypes);

router.patch(
  "/:id",
  validateRequest(BedTypeValidation.updateBedTypeZodSchema),
  checkAuth(Role.ADMIN),
  BedTypeController.updateBedType
);

router.delete("/:id",checkAuth(Role.ADMIN), BedTypeController.deleteBedType);

export const BedTypeRoutes = router;