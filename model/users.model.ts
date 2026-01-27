import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    refreshToken: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const usersSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, select: false },
        refreshToken: { type: String, select: false },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>("user", usersSchema);
