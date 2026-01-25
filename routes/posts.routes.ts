import express from "express";
import postsController from "../controller/posts.controller";

const router = express.Router();

router.post("/", postsController.createPost);

export default router;
