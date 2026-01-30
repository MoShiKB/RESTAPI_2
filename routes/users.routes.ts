import express from "express";
import usersController from "../controller/users.controller";
const router = express.Router();
import isAuthorized from "../middleware/authorization";

router.get("/", usersController.getAllUsers);
router.get("/:id", usersController.getUserById);
router.put("/:id", isAuthorized, usersController.updateUser);
router.delete("/:id", isAuthorized, usersController.deleteUser);

export default router;
