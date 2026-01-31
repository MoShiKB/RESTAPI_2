import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel, { IUser } from "../model/users.model";
import { AuthRequest } from "../middleware/authorization";

interface ITokenPayload {
    userId: string;
}

const register = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await userModel.exists({ $or: [{ email }, { username }] });
        if (existingUser) {
            res.status(400).json({ error: "Username or email already exists!" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await userModel.create({
            username,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Registration failed" });
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"] }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"] }
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
};

const logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = req.user;

        if (!user) {
            res.status(403).json({ error: "Not Authorized!" });
            return;
        }

        user.refreshToken = null;
        await user.save();

        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Logout failed" });
    }
};

const refreshToken = async (req: Request, res: Response): Promise<void> => {
    const token = req.body?.refreshToken;

    if (!token) {
        res.status(400).json({ error: "Refresh token required" });
        return;
    }

    try {
        const decodedToken = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET!
        ) as ITokenPayload;

        const user = await userModel.findById(decodedToken.userId).select("+refreshToken");

        if (!user || user.refreshToken !== token) {
            res.status(403).json({ error: "Invalid refresh token" });
            return;
        }

        const newAccessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"] }
        );

        res.status(200).json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(400).json({ error: "Invalid or expired refresh token" });
    }
};

export default {
    register,
    login,
    logout,
    refreshToken,
};
