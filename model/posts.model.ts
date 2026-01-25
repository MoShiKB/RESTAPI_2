import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
    title: string;
    content: string;
    senderId: number;
}

const postsSchema = new Schema<IPost>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    senderId: { type: Number, required: true },
});

export default mongoose.model<IPost>("post", postsSchema);
