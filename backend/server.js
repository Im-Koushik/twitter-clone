import express from "express";
import dotenv from "dotenv";
import connectMongoDb from "./db/connectMongoDb.js";
import cookieParser from "cookie-parser";

//Routes
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//Routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port 5000");
  connectMongoDb();
});
