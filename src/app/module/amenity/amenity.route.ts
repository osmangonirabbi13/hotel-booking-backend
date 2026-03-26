import express from "express";

import { AmenityController } from "./amenity.controller";
import { AmenityValidation } from "./amenity.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.post(
  "/",
  validateRequest(AmenityValidation.createAmenityZodSchema),
  checkAuth(Role.ADMIN),
  AmenityController.createAmenity
);

router.get("/",checkAuth(Role.ADMIN), AmenityController.getAllAmenities);


router.patch(
  "/:id",
  validateRequest(AmenityValidation.updateAmenityZodSchema),
  checkAuth(Role.ADMIN),
  AmenityController.updateAmenity
);

router.delete("/:id",checkAuth(Role.ADMIN), AmenityController.deleteAmenity);

export const AmenityRoutes = router;