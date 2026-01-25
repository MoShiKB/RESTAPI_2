import { Request, Response } from "express";
import postModel from "../model/posts.model";


const createPost = async (req: Request, res: Response): Promise<void> => {
    const postData = req.body;
    console.log(postData);
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
        const sender = req.query.sender;

        if (sender) {
            const postsBySender = await postModel.find({ senderId: Number(sender) });
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

export default {
    createPost,
    getAllPosts,
};