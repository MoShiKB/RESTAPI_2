import express from "express";
import commentsController from "../controller/comments.controller";
import isAuthorized from "../middleware/authorization";

const router = express.Router();
/**
 * @swagger
 * /comment/post/{postId}:
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
router.get("/post/:postId", isAuthorized, commentsController.getCommentsByPostId);

/**
 * @swagger
 * /comment/post/{postId}:
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
router.post("/post/:postId", isAuthorized, commentsController.createComment);

/**
 * @swagger
 * /comment:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get all comments (requires auth)
 *     security:
 *       - bearerAuth: []
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
router.get("/", isAuthorized, commentsController.getAllComments);

/**
 * @swagger
 * /comment:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a comment (requires auth)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               content:
 *                 type: string
 *             required:
 *               - postId
 *               - content
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 */
router.post("/", isAuthorized, commentsController.createComment);

/**
 * @swagger
 * /comment/{id}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get a comment by id (requires auth)
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 */
router.get("/:id", isAuthorized, commentsController.getCommentById);

/**
 * @swagger
 * /comment/{id}:
 *   put:
 *     tags:
 *       - Comments
 *     summary: Update a comment (requires auth)
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
router.put("/:id", isAuthorized, commentsController.updateComment);

/**
 * @swagger
 * /comment/{id}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment (requires auth)
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
router.delete("/:id", isAuthorized, commentsController.deleteComment);
export default router;
