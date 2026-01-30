import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
    postId: mongoose.Types.ObjectId;
    content: string;
    author: Types.ObjectId;
}

const commentsSchema = new Schema<IComment>({
    postId: { type: Schema.Types.ObjectId, ref: "post", required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model<IComment>("comment", commentsSchema);
