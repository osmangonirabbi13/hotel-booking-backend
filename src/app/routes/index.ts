import { Router } from "express";
import { RoomCategoryRoutes } from "../module/roomCategory/roomCategory.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";
import { BedTypeRoutes } from "../module/bedType/bedType.route";
import { AmenityRoutes } from "../module/amenity/amenity.route";
import { ExtraServiceRoutes } from "../module/extraService/extraService.route";
import { RoomRoutes } from '../module/room/room.route';


const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/room-categories", RoomCategoryRoutes )
router.use("/bad-types", BedTypeRoutes)
router.use("/amenities", AmenityRoutes)
router.use("/extra-services", ExtraServiceRoutes)
router.use("/rooms", RoomRoutes)


export const IndexRoutes = router;