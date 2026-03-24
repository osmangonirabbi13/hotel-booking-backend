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



export const BedTypeRoutes = router;