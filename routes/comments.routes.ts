import express from "express";
import commentsController from "../controller/comments.controller";
import isAuthorized from "../middleware/authorization";

const router = express.Router();
router.get("/post/:postId", isAuthorized, commentsController.getCommentsByPostId);
router.get("/:id", isAuthorized, commentsController.getCommentById);
router.post("/", isAuthorized, commentsController.createComment);
router.put("/:id", isAuthorized, commentsController.updateComment);
router.delete("/:id", isAuthorized, commentsController.deleteComment);

export const postCommentsRouter = express.Router({ mergeParams: true });

postCommentsRouter.get("/", isAuthorized, commentsController.getCommentsByPostId);
postCommentsRouter.post("/", isAuthorized, commentsController.createComment);
postCommentsRouter.get("/:id", isAuthorized, commentsController.getCommentById);
postCommentsRouter.put("/:id", isAuthorized, commentsController.updateComment);
postCommentsRouter.delete("/:id", isAuthorized, commentsController.deleteCommentInPost);
postCommentsRouter.delete("/", isAuthorized, commentsController.deleteAllCommentsForPost);

export default router;
