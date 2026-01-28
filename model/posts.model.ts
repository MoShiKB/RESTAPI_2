import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPost extends Document {
    title: string;
    content: string;
    senderId: Types.ObjectId;
    comments: Types.ObjectId[];
}

const postsSchema = new Schema<IPost>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'comment' }],
});

export default mongoose.model<IPost>("post", postsSchema);
