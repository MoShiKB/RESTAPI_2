import express from "express";
import usersController from "../controller/users.controller";
const router = express.Router();
import isAuthorized from "../middleware/authorization";

/**
 * @swagger
 * /user:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users (requires auth)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: OK
 */
router.get("/", usersController.getAllUsers);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID (requires auth)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 */
router.get("/:id", usersController.getUserById);

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update a user (requires auth)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '200':
 *         description: Updated
 */
router.put("/:id", isAuthorized, usersController.updateUser);

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete a user (requires auth)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Deleted
 */
router.delete("/:id", isAuthorized, usersController.deleteUser);

export default router;
