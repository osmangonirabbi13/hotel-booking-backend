import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register", AuthController.registerCustomer);
router.post("/login", AuthController.loginUser);

router.get(
  "/me",

  AuthController.getMe,
);

router.post("/refresh-token", AuthController.getNewToken);

router.post(
  "/change-password",

  AuthController.changePassword,
);

router.post(
  "/logout",

  AuthController.logoutUser,
);

export const AuthRoutes = router;
