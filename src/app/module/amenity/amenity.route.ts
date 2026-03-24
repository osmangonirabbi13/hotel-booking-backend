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

router.get("/", AmenityController.getAllAmenities);


router.patch(
  "/:id",
  validateRequest(AmenityValidation.updateAmenityZodSchema),
  AmenityController.updateAmenity
);

router.delete("/:id", AmenityController.deleteAmenity);

export const AmenityRoutes = router;