import { Router } from "express";
import { RoomCategoryController } from "./roomCategory.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createRoomCategorySchema, updateRoomCategorySchema } from "./roomCategory.validation";



const router = Router();

router.post("/",validateRequest(createRoomCategorySchema) , RoomCategoryController.createRoomCategory )
router.get("/", RoomCategoryController.getAllRoomCategories)

router.patch(
  "/:id",
  validateRequest(updateRoomCategorySchema),
  RoomCategoryController.updateRoomCategory
);

export const RoomCategoryRoutes = router;