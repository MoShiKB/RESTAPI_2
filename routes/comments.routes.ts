import express from "express";
import commentsController from "../controller/comments.controller";
import isAuthorized from "../middleware/authorization";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /post/{postId}/comment:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get comments for a post (requires auth)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get("/", commentsController.getCommentsByPostId);

/**
 * @swagger
 * /post/{postId}/comment:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a comment for a post (requires auth)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *             required:
 *               - content
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 */
router.post("/", commentsController.createComment);

/**
 * @swagger
 * /post/{postId}/comment/{id}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get a comment by id (requires auth)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 */
router.get("/:id", commentsController.getCommentById);

/**
 * @swagger
 * /post/{postId}/comment/{id}:
 *   put:
 *     tags:
 *       - Comments
 *     summary: Update a comment (requires auth)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
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
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *             required:
 *               - content
 *     responses:
 *       '200':
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 */
router.put("/:id", commentsController.updateComment);

/**
 * @swagger
 * /post/{postId}/comment/{id}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment (requires auth)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Deleted
 */
router.delete("/:id", commentsController.deleteComment);

export default router;
