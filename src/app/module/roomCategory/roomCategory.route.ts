import { Router } from "express";
import { RoomCategoryController } from "./roomCategory.controller";



const router = Router();

router.post("/", RoomCategoryController.createRoomCategory )

export const RoomCategoryRoutes = router;