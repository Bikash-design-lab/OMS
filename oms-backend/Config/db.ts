// ./Config/db.ts
import mongoose from 'mongoose';

export const ConnectToDB = async (mongoURI: string): Promise<void> => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected.');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

// import mongoose from 'mongoose';

// export const ConnectToDB = async (): Promise<void> => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI as string);
//     console.log('MongoDB connected.');
//   } catch (error) {
//     console.error('Failed to connect MongoDB.', error);
//     process.exit(1);
//   }
// };

// const mongoose = require("mongoose");


// const ConnectToDB = () => {
//   try {
//     mongoose.connect(process.env.MONGODB_URI);
//     console.log("MongoDB connected.");
//   } catch (error) {
//     console.log("Failed to connect MongoDB.", error);
//   }
// };

// module.exports = { ConnectToDB };
