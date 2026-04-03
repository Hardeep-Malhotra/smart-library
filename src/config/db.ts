import mongoose from 'mongoose';
import config from './config.js';

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully ✅');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error ❌', err);
    });
    await mongoose.connect(config.dataBaseUrl!);
  } catch (error) {
    console.error('MongoDB connection error ❌', error);
    process.exit(1);
  }
};

export default connectDB;
