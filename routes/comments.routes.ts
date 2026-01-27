import express from "express";
import commentsController from "../controller/comments.controller";
import isAuthorized from "../middleware/authorization";

const router = express.Router();

router.get("/", commentsController.getAllComments);
router.get("/post/:postId", commentsController.getCommentsByPostId);
router.get("/:id", commentsController.getCommentById);
router.post("/", isAuthorized, commentsController.createComment);
router.put("/:id",isAuthorized, commentsController.updateComment);
router.delete("/:id", isAuthorized, commentsController.deleteComment);

export default router;
