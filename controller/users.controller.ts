import { Request, Response } from "express";
import userModel from "../model/users.model";

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await userModel.find();
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get users" });
    }
};

const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get user" });
    }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { username, email } = req.body;

        // Don't allow updating username or email (security)
        if (username || email) {
            res.status(400).json({ error: "Updating username or email is not allowed" });
            return;
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!updatedUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update user" });
    }
};

const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedUser = await userModel.findByIdAndDelete(id);

        if (!deletedUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete user" });
    }
};

export default {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};
