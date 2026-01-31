import express from "express";
import postsController from "../controller/posts.controller";
import isAuthorized from "../middleware/authorization";

import commentsRouter from "./comments.routes";

const router = express.Router();

router.use("/:postId/comment", commentsRouter);

/**
 * @swagger
 * /post:
 *   post:
 *     tags:
 *       - Posts
 *     summary: Create a new post (requires auth)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       '201':
 *         description: Created
 *       '401':
 *         description: Unauthorized
 */
router.post("/", postsController.createPost);

/**
 * @swagger
 * /post:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Get all posts (requires auth)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: OK
 */
router.get("/", postsController.getAllPosts);

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Get post by ID (requires auth)
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
router.get("/:id", postsController.getPostById);

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     tags:
 *       - Posts
 *     summary: Update a post (requires auth)
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
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       '200':
 *         description: Updated
 *       '401':
 *         description: Unauthorized
 */
router.put("/:id", postsController.updatePost);

/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     tags:
 *       - Posts
 *     summary: Delete a post (requires auth)
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
 *       '401':
 *         description: Unauthorized
 */
router.delete("/:id", postsController.deletePost);

export default router;