import { Router } from "express";
import { RoomCategoryRoutes } from "../module/roomCategory/roomCategory.route";
import { AuthRoutes } from "../module/auth/auth.route";


const router = Router();

router.use("/auth", AuthRoutes);
router.use("/room-categories", RoomCategoryRoutes )


export const IndexRoutes = router;