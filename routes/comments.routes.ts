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
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       '201':
 *         description: Created
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
 */
router.get("/", isAuthorized, commentsController.getAllComments);

/**
 * @swagger
 * /comment/post/{postId}/{id}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get a comment by id in a post (requires auth)
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
 */
router.get("/post/:postId/:id", isAuthorized, commentsController.getCommentByIdInPost);

/**
 * @swagger
 * /comment/post/{postId}/{id}:
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
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       '200':
 *         description: Updated
 */
router.put("/post/:postId/:id", isAuthorized, commentsController.updateCommentInPost);

/**
 * @swagger
 * /comment/post/{postId}/{id}:
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
router.delete("/post/:postId/:id", isAuthorized, commentsController.deleteCommentInPost);
export default router;








