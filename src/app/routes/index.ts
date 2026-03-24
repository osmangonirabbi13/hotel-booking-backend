import { Router } from "express";
import { RoomCategoryRoutes } from "../module/roomCategory/roomCategory.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";
import { BedTypeRoutes } from "../module/bedType/bedType.route";


const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/room-categories", RoomCategoryRoutes )
router.use("/bad-types", BedTypeRoutes)


export const IndexRoutes = router;