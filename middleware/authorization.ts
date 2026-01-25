import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import userModel, { IUser } from "../model/users.model";

interface ITokenPayload {
    userId: string;
}

export interface AuthRequest extends Request {
    user?: IUser;
}

const isAuthorized = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
        res.status(403).json({ error: "Authorization header not found!" });
        return;
    }

    const token = authHeaders.split(" ")[1];
    if (!token) {
        res.status(403).json({ error: "Authorization token missing!" });
        return;
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as ITokenPayload;
        const user: IUser | null = await userModel.findById(decodedToken.userId);

        if (!user) {
            res.status(403).json({ error: "Not Authorized!" });
            return;
        }

        req.user = user;
        next();
    } catch (ex) {
        res.status(403).json({ error: "Not Authorized!" });
    }
};

export default isAuthorized;
