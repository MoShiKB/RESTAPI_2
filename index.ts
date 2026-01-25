import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import postsRoutes from "./routes/posts.routes";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use("/post", postsRoutes);

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
  
  startServer();








