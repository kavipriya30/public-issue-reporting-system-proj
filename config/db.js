const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }
    
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.warn("MongoDB Connection Failed, using fallback:", error.message);
    // Continue without MongoDB for demo purposes
    console.log("Running in demo mode without database");
  }
};

module.exports = connectDB;
