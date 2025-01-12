const net = require('net');
const { parseGT06Message } = require('./gt06Parser');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // Import the UUID package
const { Console } = require('console');

// Create TCP server
const tcpServer = net.createServer((socket) => {
    Console.log('Device connected:', socket.remoteAddress);

    socket.on('data', async (data) => {
        Console.log('Raw Data:', data.toString('hex'));

        try {
            const parsedMessage = parseGT06Message(data);

            if (parsedMessage) {
                Console.log('Parsed Message:', parsedMessage);

                // Handle data based on the parsed message type
                switch (parsedMessage.type) {
                    case 'location':
                        Console.log('Location Data:', parsedMessage);
                        // await saveLocationData(parsedMessage);
                        break;
                    case 'alarm':
                        Console.log('Alarm Data:', parsedMessage);
                        // await saveAlarmData(parsedMessage);
                        break;
                    case 'heartbeat':
                        Console.log('HeartBeat Data:', parsedMessage);
                        // await saveHeartbeatData(parsedMessage);
                        break;
                    case 'status':
                        Console.log('Status Data:', parsedMessage);
                        // await saveStatusData(parsedMessage);
                        break;
                    default:
                        console.error(`Unknown message type: ${parsedMessage.type}`);
                }

                // Send an acknowledgment if required
                if (parsedMessage.ack) {
                    socket.write(Buffer.from(parsedMessage.ack, 'hex'));
                    Console.log('Acknowledgment sent:', parsedMessage.ack);
                }
            }
        } catch (error) {
            console.error('Error processing GT06 data:', error);
        }
    });

    socket.on('end', () => {
        Console.log('Device disconnected:', socket.remoteAddress);
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});

async function saveLocationData(locationData) {
    // Check if the timestamp is 0 and handle it accordingly
    if (locationData.timestamp.getTime() === 0) {
        locationData.timestamp = new Date(); // Use the current timestamp or another valid timestamp
    }

    // Format the timestamp to 'YYYY-MM-DD HH:MM:SS'
    const formattedTimestamp = locationData.timestamp.toISOString().slice(0, 19).replace('T', ' ');

    // Generate a UUID for the id
    const id = uuidv4();

    // Insert the data into the database
    const [rows, fields] = await db.execute(
        `INSERT INTO location_data (id, device_id, latitude, longitude, speed, direction, gps_status, altitude, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            locationData.deviceId,
            locationData.latitude,
            locationData.longitude,
            locationData.speed,
            locationData.direction,
            locationData.gpsStatus,
            locationData.altitude,
            formattedTimestamp
        ]
    );

    return rows;
}

// Save alarm data to the database
const saveAlarmData = async (data) => {
    // Check if the timestamp is 0 and handle it accordingly
    if (data.timestamp.getTime() === 0) {
        data.timestamp = new Date(); // Use the current timestamp or another valid timestamp
    }

    // Format the timestamp to 'YYYY-MM-DD HH:MM:SS'
    const formattedTimestamp = data.timestamp.toISOString().slice(0, 19).replace('T', ' ');

    // Generate a UUID for the id
    const id = uuidv4();

    const sql = `INSERT INTO alarm_data (id, device_id, alarm_type, message, latitude, longitude, timestamp)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await db.execute(sql, [
        id,
        data.deviceId,
        data.alarmType,
        data.message || '',  // Default empty message if not provided
        data.latitude,
        data.longitude,
        formattedTimestamp,
    ]);
};

// Save heartbeat data to the database
const saveHeartbeatData = async (data) => {
    // Generate a UUID for the id
    const id = uuidv4();

    const sql = `INSERT INTO heartbeat (id, device_id, voltage_level, battery_level, gsm_signal_strength, gps_status, timestamp)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await db.execute(sql, [
        id,
        data.deviceId,
        data.voltageLevel,
        data.batteryLevel,
        data.gsmSignalStrength,
        data.gpsStatus,
        new Date()
    ]);
};

// Save status data to the database
const saveStatusData = async (data) => {
    // Generate a UUID for the id
    const id = uuidv4();

    const sql = `INSERT INTO status_data (id, device_id, status, timestamp)
                 VALUES (?, ?, ?, ?)`;
    await db.execute(sql, [
        id,
        data.deviceId,
        data.status,
        data.timestamp
    ]);
};

// Start the TCP server
const startTcpServer = (port = 5000) => {
    tcpServer.listen(port, () => {
        Console.log(`TCP Server listening on port ${port}`);
    });
};

module.exports = { startTcpServer };