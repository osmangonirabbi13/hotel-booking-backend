import { Router } from "express";
import { RoomCategoryRoutes } from "../module/roomCategory/roomCategory.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";


const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/room-categories", RoomCategoryRoutes )


export const IndexRoutes = router;