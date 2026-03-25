import express from "express";


import { validateRequest } from "../../middleware/validateRequest";
import { RoomValidation } from "./room.validation";
import { RoomController } from "./room.controller";

const router = express.Router();

router.post(
  "/",
    validateRequest(RoomValidation.createRoomZodSchema),
    RoomController.createRoom
);

router.get("/", RoomController.getAllRooms);


export const RoomRoutes = router;