const express = require('express');
const http = require('http');
const { startTcpServer } = require('./modules/tcpSocket');
const { startWebSocketServer } = require('./modules/webSocket');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Start TCP Server
startTcpServer(5000);

// Start WebSocket Server
startWebSocketServer(server);

// Test Endpoint
app.get('/', (req, res) => {
    res.send('GPS Tracker Backend is Running');
});

// Start HTTP Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
