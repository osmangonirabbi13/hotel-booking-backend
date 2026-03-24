import express from "express";

import { AmenityController } from "./amenity.controller";
import { AmenityValidation } from "./amenity.validation";
import { validateRequest } from "../../middleware/validateRequest";

const router = express.Router();

router.post(
  "/",
  validateRequest(AmenityValidation.createAmenityZodSchema),
  AmenityController.createAmenity
);



export const AmenityRoutes = router;