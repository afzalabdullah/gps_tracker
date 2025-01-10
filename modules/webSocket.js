const WebSocket = require('ws');

const startWebSocketServer = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('Frontend connected to WebSocket');

        ws.on('message', (message) => {
            console.log('Message from frontend:', message);
        });

        ws.on('close', () => {
            console.log('Frontend disconnected');
        });
    });

    console.log('WebSocket server started');
};

module.exports = { startWebSocketServer };
