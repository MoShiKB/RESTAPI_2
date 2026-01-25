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

export default {
    createPost,
};