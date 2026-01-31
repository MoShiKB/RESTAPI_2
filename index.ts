import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import postsRoutes from "./routes/posts.routes";
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import isAuthorized from "./middleware/authorization";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRoutes);
app.use("/user", isAuthorized, usersRoutes);
app.use("/post", isAuthorized, postsRoutes);

const startServer = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("Connected to Database");

  } catch (err) {
    console.error("DB connect error:", err);
    process.exit(1);
  }

  return app.listen(port, () => {
    console.log(`\nServer is listening on port: ${port} \n`);
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
export { startServer };
