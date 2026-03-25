import express from "express";

import { validateRequest } from "../../middleware/validateRequest";
import { RoomValidation } from "./room.validation";
import { RoomController } from "./room.controller";

const router = express.Router();

router.post(
  "/",
  validateRequest(RoomValidation.createRoomZodSchema),
  RoomController.createRoom,
);

router.get("/", RoomController.getAllRooms);

router.get("/:id", RoomController.getSingleRoom);
router.patch("/:id", RoomController.updateRoom);
router.delete("/:id", RoomController.deleteRoom);

export const RoomRoutes = router;
