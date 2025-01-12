require('dotenv').config();  // Load the .env file first
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        if (!uri) {
            console.error("MongoDB URI not defined. Please check your .env file.");
            return;
        }

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Could not connect to MongoDB:', error.message);
        throw error;
    }
};

module.exports = connectDB;
