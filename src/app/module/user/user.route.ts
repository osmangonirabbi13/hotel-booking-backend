
import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { UserValidation } from "./user.validation";


const router = Router();


router.post(
  "/create-admin",
  validateRequest(UserValidation.createAdminZodSchema),
  UserController.createAdmin,
);

export const UserRoutes = router;