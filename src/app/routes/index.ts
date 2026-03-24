import { Router } from "express";
import { RoomCategoryRoutes } from "../module/roomCategory/roomCategory.route";


const router = Router();


router.use("/room-categories", RoomCategoryRoutes )


export const IndexRoutes = router;