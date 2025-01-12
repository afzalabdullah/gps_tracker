const express = require('express');
const http = require('http');
const { startTcpServer } = require('./modules/tcpSocket');
const { startWebSocketServer } = require('./modules/webSocket');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Start TCP Server
startTcpServer();

// Start WebSocket Server
startWebSocketServer(server);

// Test Endpoint
app.get('/', (req, res) => {
    res.send('GPS Tracker Backend is Running');
});

const PORT = process.env.HTTP_PORT || 5000; 
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});