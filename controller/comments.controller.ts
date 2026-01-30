import { Request, Response } from "express";
import commentModel from "../model/comments.model";
import postModel from "../model/posts.model";

const sendDbError = (res: Response, err: unknown) => {
  const msg = err instanceof Error ? err.message : "Database error";
  return res.status(500).json({ error: msg });
};

export const getAllComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await commentModel.find();
    res.json(comments);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
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

const createComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;
        const { content, author } = req.body;
        const authorId = author || (req as any).user?.userId;
        
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


const deleteCommentInPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId, id } = req.params;

    const post = await postModel.findById(postId);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const deleted = await commentModel.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    await postModel.findByIdAndUpdate(postId, { $pull: { comments: deleted._id } });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    sendDbError(res, err);
  }
};


const getCommentByIdInPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId, id } = req.params;
        
        const post = await postModel.findById(postId);
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }
        
        const comment = await commentModel.findById(id);
        
        if (!comment) {
            res.status(404).json({ error: "Comment not found" });
            return;
        }
        
        if (comment.postId.toString() !== postId) {
            res.status(404).json({ error: "Comment not found" });
            return;
        }
        
        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: "Failed to get comment" });
    }
};

const updateCommentInPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId, id } = req.params;
        const { content } = req.body;
        const post = await postModel.findById(postId);
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }

        const updatedComment = await commentModel.findByIdAndUpdate(
            id,
            { content },
            { new: true }
        );

        if (!updatedComment) {
            res.status(404).json({ error: "Comment not found" });
            return;
        }

        if (updatedComment.postId.toString() !== postId) {
            res.status(404).json({ error: "Comment not found" });
            return;
        }

        res.json(updatedComment);
    } catch (err) {
        res.status(500).json({ error: "Failed to update comment" });
    }
};
export default {
  getAllComments,
  getCommentsByPostId,
  createComment,
  deleteCommentInPost,
  getCommentByIdInPost,
  updateCommentInPost,
};
