const net = require('net');
const { parseGT06Message } = require('./gt06Parser');
const { v4: uuidv4 } = require('uuid'); // Import the UUID package

// Import Mongoose models
const LocationData = require('../models/LocationData');
const AlarmData = require('../models/AlarmData');
const HeartbeatData = require('../models/HeartbeatData');
const StatusData = require('../models/StatusData');



// Create TCP server
const tcpServer = net.createServer((socket) => {
    console.log('Device connected:', socket.remoteAddress);

    socket.on('data', async (data) => {
        console.log('Raw Data:', data.toString('hex'));

        try {
            const parsedMessage = parseGT06Message(data);

            if (parsedMessage) {
                console.log('Parsed Message:', parsedMessage);

                switch (parsedMessage.type) {
                    case 'location':
                        console.log('Location Data:', parsedMessage);
                        // Save location data to MongoDB
                        await saveLocationData(parsedMessage);
                        break;
                    case 'alarm':
                        console.log('Alarm Data:', parsedMessage);
                        // Save alarm data to MongoDB
                        await saveAlarmData(parsedMessage);
                        break;
                    case 'heartbeat':
                        console.log('HeartBeat Data:', parsedMessage);
                        // Save heartbeat data to MongoDB
                        await saveHeartbeatData(parsedMessage);
                        break;
                    case 'status':
                        console.log('Status Data:', parsedMessage);
                        // Save status data to MongoDB
                        await saveStatusData(parsedMessage);
                        break;
                    default:
                        console.error(`Unknown message type: ${parsedMessage.type}`);
                }

                // Send an acknowledgment if required
                if (parsedMessage.ack) {
                    socket.write(Buffer.from(parsedMessage.ack, 'hex'));
                    console.log('Acknowledgment sent:', parsedMessage.ack);
                }
            }
        } catch (error) {
            console.error('Error processing GT06 data:', error);
        }
    });

    socket.on('end', () => {
        console.log('Device disconnected:', socket.remoteAddress);
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});

// Function to save location data
const saveLocationData = async (parsedMessage) => {
    const locationData = new LocationData({
        deviceId: parsedMessage.deviceId,
        dateTime: parsedMessage.dateTime,
        latitude: parsedMessage.latitude,
        longitude: parsedMessage.longitude,
        speed: parsedMessage.speed,
        courseStatus: parsedMessage.courseStatus,
        mcc: parsedMessage.mcc,
        mnc: parsedMessage.mnc,
        lac: parsedMessage.lac,
        cellId: parsedMessage.cellId,
        serialNumber: parsedMessage.serialNumber
    });

    try {
        await locationData.save();
        console.log('Location data saved:', locationData);
    } catch (error) {
        console.error('Error saving location data:', error);
    }
};

// Function to save alarm data
const saveAlarmData = async (parsedMessage) => {
    const alarmData = new AlarmData({
        dateTime: parsedMessage.dateTime,
        satelliteInfo: parsedMessage.satelliteInfo,
        latitude: parsedMessage.latitude,
        longitude: parsedMessage.longitude,
        speed: parsedMessage.speed,
        direction: parsedMessage.direction,
        mcc: parsedMessage.mcc,
        mnc: parsedMessage.mnc,
        lac: parsedMessage.lac,
        cellId: parsedMessage.cellId,
        terminalInfo: parsedMessage.terminalInfo,
        voltageLevel: parsedMessage.voltageLevel,
        gsmSignalStrength: parsedMessage.gsmSignalStrength,
        alarmStatus: parsedMessage.alarmStatus,
        language: parsedMessage.language,
        serialNumber: parsedMessage.serialNumber
    });

    try {
        await alarmData.save();
        console.log('Alarm data saved:', alarmData);
    } catch (error) {
        console.error('Error saving alarm data:', error);
    }
};


// Function to save heartbeat data
const saveHeartbeatData = async (parsedMessage) => {
    const heartbeatData = new HeartbeatData({
        terminalInfo: parsedMessage.terminalInfo,
        voltageLevel: parsedMessage.voltageLevel,
        gsmSignalStrength: parsedMessage.gsmSignalStrength,
        alarmStatus: parsedMessage.alarmStatus,
        language: parsedMessage.language,
        serialNumber: parsedMessage.serialNumber
    });

    try {
        await heartbeatData.save();
        console.log('Heartbeat data saved:', heartbeatData);
    } catch (error) {
        console.error('Error saving heartbeat data:', error);
    }
};

// Function to save status data
const saveStatusData = async (parsedMessage) => {
    const statusData = new StatusData({
        terminalInfo: parsedMessage.terminalInfo,
        voltageLevel: parsedMessage.voltageLevel,
        gsmSignalStrength: parsedMessage.gsmSignalStrength,
        alarmStatus: parsedMessage.alarmStatus,
        serialNumber: parsedMessage.serialNumber
    });

    try {
        await statusData.save();
        console.log('Status data saved:', statusData);
    } catch (error) {
        console.error('Error saving status data:', error);
    }
};

// Start the TCP server
const startTcpServer = () => {
    const port = process.env.TCP_PORT || 6608; // Use the port from the .env file or default to 6608
    tcpServer.listen(port, () => {
        console.log(`TCP Server listening on port ${port}`);
    });
};
module.exports = { startTcpServer };