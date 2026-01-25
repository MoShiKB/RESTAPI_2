import express from "express";
import commentsController from "../controller/comments.controller";

const router = express.Router();

router.get("/", commentsController.getAllComments);
router.get("/post/:postId", commentsController.getCommentsByPostId);
router.get("/:id", commentsController.getCommentById);
router.post("/", commentsController.createComment);
router.put("/:id", commentsController.updateComment);
router.delete("/:id", commentsController.deleteComment);

export default router;
