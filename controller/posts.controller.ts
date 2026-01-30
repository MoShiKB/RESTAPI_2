import { Request, Response } from "express";
import postModel from "../model/posts.model";
import mongoose from "mongoose";


const createPost = async (req: Request, res: Response): Promise<void> => {
  const postData = req.body;
  console.log(postData);
  console.log("BODY:", req.body);

  if (!postData?.senderId) {
    res.status(400).json({ error: "senderId is required" });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(postData.senderId)) {
    res.status(400).json({ error: "Invalid senderId" });
    return;
  }
  postData.senderId = new mongoose.Types.ObjectId(postData.senderId);
  try {
    const newPost = await postModel.create(postData);
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
};

const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const sender = req.query.sender as string | undefined;

    if (sender) {
      if (!mongoose.Types.ObjectId.isValid(sender)) {
        res.status(400).json({ error: "Invalid sender id" });
        return; }
      const postsBySender = await postModel.find({
        senderId: new mongoose.Types.ObjectId(sender),
      });
      res.json(postsBySender);
      return;
    } else {
    const posts = await postModel.find();
    res.json(posts);
    return;
  }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get posts" });
  }
};
const getPostById = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    try {
        const post = await postModel.findById(postId);
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get post by ID" });
    }
};
const updatePost = async (req: Request, res: Response): Promise<void> => {
    const postId = req.params.id;
    const updateData = req.body;
    try {
        const post = await postModel.findByIdAndUpdate(postId, updateData, { new: true });
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update post" });
    }
};
const deletePost = async (req: Request, res: Response): Promise<void> => {
  const postId = req.params.id;
  try {
    const deleted = await postModel.findByIdAndDelete(postId);
    if (!deleted) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete post" });
  }
};


export default {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
};