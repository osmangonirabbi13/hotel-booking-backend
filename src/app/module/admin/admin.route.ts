import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { AdminController } from "./admin.controller";


const router = Router();

router.get("/",
    checkAuth(Role.ADMIN),
    AdminController.getAllAdmins);
router.get("/:id",
    checkAuth(Role.ADMIN),
    AdminController.getAdminById);


router.patch("/change-user-status", 
    checkAuth( Role.ADMIN),
     AdminController.changeUserStatus);
router.patch("/change-user-role",
     checkAuth(Role.ADMIN),
     AdminController.changeUserRole);

export const AdminRoutes = router;