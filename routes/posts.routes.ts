import express from "express";
import postsController from "../controller/posts.controller";

const router = express.Router();

router.post("/", postsController.createPost);
router.get("/", postsController.getAllPosts);
router.get("/:id", postsController.getPostById);
router.put("/:id", postsController.updatePost);

export default router;
