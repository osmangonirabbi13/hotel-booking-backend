import express from "express";

import { RoomController } from "./room.controller";
import { multerUpload } from "../../config/multer.config";
import { createRoomMiddleware } from "./room.middleware";
import { validateRequest } from "../../middleware/validateRequest";
import { RoomValidation } from "./room.validation";
import { updateRoomMiddleware } from "./updateRoomMiddleware";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();

router.post(
  "/create-room",
  multerUpload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "sliderImages", maxCount: 10 },
  ]),
  createRoomMiddleware,
  validateRequest(RoomValidation.createRoomZodSchema),
  checkAuth(Role.ADMIN),
  RoomController.createRoom,
);

router.get("/", checkAuth(Role.ADMIN , Role.CUSTOMER), RoomController.getAllRooms);

router.get("/:id", checkAuth(Role.ADMIN , Role.CUSTOMER), RoomController.getSingleRoom);

router.patch(
  "/:id",
  multerUpload.fields([
    { name: "featuredImage", maxCount: 1 },
    { name: "sliderImages", maxCount: 10 },
  ]),
  updateRoomMiddleware,
  validateRequest(RoomValidation.updateRoomZodSchema),
  RoomController.updateRoom,
);
router.delete("/:id",checkAuth(Role.ADMIN), RoomController.deleteRoom);

export const RoomRoutes = router;
