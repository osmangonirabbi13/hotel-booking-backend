import { Router } from "express";
import { RoomCategoryController } from "./roomCategory.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createRoomCategorySchema,
  updateRoomCategorySchema,
} from "./roomCategory.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN),
  validateRequest(createRoomCategorySchema),
  RoomCategoryController.createRoomCategory,
);
router.get("/", RoomCategoryController.getAllRoomCategories);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(updateRoomCategorySchema),
  RoomCategoryController.updateRoomCategory,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN),
  RoomCategoryController.deleteRoomCategory,
);

export const RoomCategoryRoutes = router;
