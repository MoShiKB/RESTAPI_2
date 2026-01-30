import express from "express";
import commentsController from "../controller/comments.controller";
import isAuthorized from "../middleware/authorization";

const router = express.Router();

router.get("/post/:postId", isAuthorized, commentsController.getCommentsByPostId);
router.post("/post/:postId", isAuthorized, commentsController.createComment);
router.get("/", isAuthorized, commentsController.getAllComments);
router.get("/post/:postId/:id", isAuthorized, commentsController.getCommentByIdInPost);
router.put("/post/:postId/:id", isAuthorized, commentsController.updateCommentInPost);
router.delete("/post/:postId/:id", isAuthorized, commentsController.deleteCommentInPost);
export default router;








