import { Request, Response } from "express";
import commentModel from "../model/comments.model";
import postModel from "../model/posts.model";

const getAllComments = async (req: Request, res: Response): Promise<void> => {
    try {
        const comments = await commentModel.find();
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get comments" });
    }
};

const getCommentsByPostId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;
        
        const post = await postModel.findById(postId);
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }

        const comments = await commentModel.find({ postId });
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get comments" });
    }
};

const getCommentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const comment = await commentModel.findById(id);
        
        if (!comment) {
            res.status(404).json({ error: "Comment not found" });
            return;
        }
        
        res.json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get comment" });
    }
};

const createComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId, content, author } = req.body;

        const post = await postModel.findById(postId);
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }

        const newComment = await commentModel.create({ postId, content, author });
        res.status(201).json(newComment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create comment" });
    }
};

const updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { content, author } = req.body;

        const updatedComment = await commentModel.findByIdAndUpdate(
            id,
            { content, author },
            { new: true }
        );

        if (!updatedComment) {
            res.status(404).json({ error: "Comment not found" });
            return;
        }

        res.json(updatedComment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update comment" });
    }
};

const deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const deletedComment = await commentModel.findByIdAndDelete(id);
        
        if (!deletedComment) {
            res.status(404).json({ error: "Comment not found" });
            return;
        }

        res.json({ message: "Comment deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete comment" });
    }
};

export default {
    getAllComments,
    getCommentsByPostId,
    getCommentById,
    createComment,
    updateComment,
    deleteComment,
};
