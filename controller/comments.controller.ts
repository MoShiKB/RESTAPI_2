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
          console.error(err);
        res.status(500).json({ error: "Failed to get comment" });  
      }
};

const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.postId ?? req.body.postId;
    const { content, author } = req.body;

    const post = await postModel.findById(postId);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const newComment = await commentModel.create({ postId, content, author });
    await postModel.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });
    res.status(201).json(newComment);
  } catch (err) {
      console.error(err);
        res.status(500).json({ error: "Failed to create comment" });
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
     console.error(err);
        res.status(500).json({ error: "Failed to update comment" });
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
   console.error(err);
        res.status(500).json({ error: "Failed to delete comment" });
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

const deleteAllCommentsForPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    const post = await postModel.findById(postId);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    await commentModel.deleteMany({ postId });
    await postModel.findByIdAndUpdate(postId, { $set: { comments: [] } });

    res.status(200).json({ message: "All comments deleted successfully" });
  } catch (err) {
    sendDbError(res, err);
  }
};
export default {
  getCommentsByPostId,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  deleteCommentInPost,
  deleteAllCommentsForPost,
};
