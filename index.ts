import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import postsRoutes from "./routes/posts.routes";
import commentsRouter, { postCommentsRouter } from "./routes/comments.routes";
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import isAuthorized from "./middleware/authorization";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/user", isAuthorized, usersRoutes);
app.use("/post", isAuthorized, postsRoutes);
app.use("/comment", isAuthorized, commentsRouter);
app.use("/post/:postId/comment", isAuthorized, postCommentsRouter);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("Connected to Database");

    app.listen(port, () => {
      console.log(`listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("DB connect error:", err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
export { startServer };
