import { Router } from "express";
import { RoomCategoryController } from "./roomCategory.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createRoomCategorySchema } from "./roomCategory.validation";



const router = Router();

router.post("/",validateRequest(createRoomCategorySchema) , RoomCategoryController.createRoomCategory )
router.get("/", RoomCategoryController.getAllRoomCategories)

export const RoomCategoryRoutes = router;