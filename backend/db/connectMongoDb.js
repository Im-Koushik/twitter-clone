import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB: ", connection.connection.host);
  } catch (err) {
    console.log("Error connecting to MongoDB: ", err.message);
  }
};

export default connectMongoDB;
