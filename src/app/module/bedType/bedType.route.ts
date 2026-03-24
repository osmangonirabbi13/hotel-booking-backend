import express from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { BedTypeValidation } from "./bedType.validation";
import { BedTypeController } from "./bedType.controller";



const router = express.Router();

router.post(
  "/",
  validateRequest(BedTypeValidation.createBedTypeZodSchema),
  BedTypeController.createBedType
);

router.get("/", BedTypeController.getAllBedTypes);

router.patch(
  "/:id",
  validateRequest(BedTypeValidation.updateBedTypeZodSchema),
  BedTypeController.updateBedType
);

router.delete("/:id", BedTypeController.deleteBedType);

export const BedTypeRoutes = router;