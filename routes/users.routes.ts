import express from "express";
import usersController from "../controller/users.controller";

const router = express.Router();

router.get("/", usersController.getAllUsers);
router.get("/:id", usersController.getUserById);
router.put("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);

export default router;
