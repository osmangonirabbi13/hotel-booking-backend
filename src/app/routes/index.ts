import { Router } from "express";
import { RoomCategoryRoutes } from "../module/roomCategory/roomCategory.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";
import { BedTypeRoutes } from "../module/bedType/bedType.route";
import { AmenityRoutes } from "../module/amenity/amenity.route";
import { ExtraServiceRoutes } from "../module/extraService/extraService.route";
import { RoomRoutes } from '../module/room/room.route';
import { CustomerRoutes } from "../module/customer/customer.route";
import { BookingRoutes } from "../module/booking/booking.route";


const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/customers", CustomerRoutes);
router.use("/room-categories", RoomCategoryRoutes )
router.use("/bed-types", BedTypeRoutes)
router.use("/amenities", AmenityRoutes)
router.use("/extra-services", ExtraServiceRoutes)
router.use("/rooms", RoomRoutes)
router.use("/bookings", BookingRoutes)


export const IndexRoutes = router;