import express from "express";


import { RoomController } from "./room.controller";
import { multerUpload } from "../../config/multer.config";
import { createRoomMiddleware } from "./room.middleware";
import { validateRequest } from "../../middleware/validateRequest";
import { RoomValidation } from "./room.validation";


const router = express.Router();

router.post(
  "/create-room",
  multerUpload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "sliderImages", maxCount: 10 },
  ]),
  createRoomMiddleware,
  validateRequest(RoomValidation.createRoomZodSchema),
  RoomController.createRoom
);

router.get("/", RoomController.getAllRooms);

router.get("/:id", RoomController.getSingleRoom);
router.patch("/:id", RoomController.updateRoom);
router.delete("/:id", RoomController.deleteRoom);

export const RoomRoutes = router;
