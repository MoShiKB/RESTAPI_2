import { Request, Response } from "express";
import commentModel from "../model/comments.model";
import postModel from "../model/posts.model";

const sendDbError = (res: Response, err: unknown) => {
  const msg = err instanceof Error ? err.message : "Database error";
  return res.status(500).json({ error: msg });
};



const getCommentsByPostId = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.postId;

    const post = await postModel.findById(postId);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const comments = await commentModel.find({ postId });
    res.status(200).json(comments);
  } catch (err) {
    sendDbError(res, err);
  }
};

const getCommentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const comment = await commentModel.findById(id);
    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }
    res.status(200).json(comment);
  } catch (err) {
    sendDbError(res, err);
  }
};

const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const { content } = req.body;
    const update: any = {};
    if (content !== undefined) update.content = content;

    const updatedComment = await commentModel.findByIdAndUpdate(id, update, { new: true });
    if (!updatedComment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    res.status(200).json(updatedComment);
  } catch (err) {
    sendDbError(res, err);
  }
};

const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const deletedComment = await commentModel.findByIdAndDelete(id);
    if (!deletedComment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    await postModel.findByIdAndUpdate(deletedComment.postId, { $pull: { comments: deletedComment._id } });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    sendDbError(res, err);
  }
};

const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params.postId ? req.params : req.body;
    const { content, author } = req.body;
    const authorId = author || (req as any).user?._id;

    if (!authorId) {
      res.status(400).json({ error: "Author is required" });
      return;
    }

    const post = await postModel.findById(postId);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const newComment = await commentModel.create({
      postId,
      content,
      author: authorId
    });

    await postModel.findByIdAndUpdate(postId, {
      $push: { comments: newComment._id }
    });

    res.status(201).json(newComment);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create comment" });
  }
};

export default {
  getCommentsByPostId,
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
};
