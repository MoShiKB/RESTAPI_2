import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
    postId: mongoose.Types.ObjectId;
    content: string;
    author: string;
}

const commentsSchema = new Schema<IComment>({
    postId: { type: Schema.Types.ObjectId, ref: "post", required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
});

export default mongoose.model<IComment>("comment", commentsSchema);
