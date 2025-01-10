const parseGT06Message = (buffer) => {
    const hexString = buffer.toString('hex');

    // Ensure it's a valid GT06 message
    if (!hexString.startsWith('7878') && !hexString.startsWith('7979')) {
        throw new Error('Invalid GT06 message format');
    }

    const protocolNumber = hexString.substring(6, 8);
    const parsedData = { protocolNumber };

    // Parse based on protocol number
    switch (protocolNumber) {
        case '01': // Login Message
            parsedData.type = 'login';
            parsedData.deviceId = hexString.substring(8, 24);
            parsedData.ack = '787805010001d9dc0d0a'; // Example acknowledgment
            break;

        case '12': // GPS Location Data
            parsedData.type = 'location';
            parsedData.deviceId = hexString.substring(8, 24);
            parsedData.latitude = parseLatitude(hexString.substring(28, 36));
            parsedData.longitude = parseLongitude(hexString.substring(36, 44));
            parsedData.speed = parseSpeed(hexString.substring(44, 46));
            parsedData.direction = parseDirection(hexString.substring(46, 50));
            parsedData.altitude = parseAltitude(hexString.substring(50, 54));
            parsedData.timestamp = parseTimestamp(hexString.substring(54, 62));
            parsedData.gpsStatus = parseInt(hexString.substring(62, 64), 16) === 1;
            break;

        case '13': // Status Information
            parsedData.type = 'status';
            parsedData.deviceId = hexString.substring(8, 24);
            parsedData.status = parseStatus(hexString.substring(24, 28));
            parsedData.timestamp = parseTimestamp(hexString.substring(28, 36));
            break;

        case '16': // Heartbeat Packet
            parsedData.type = 'heartbeat';
            parsedData.deviceId = hexString.substring(8, 24);
            parsedData.voltageLevel = parseVoltageLevel(hexString.substring(24, 26));
            parsedData.gsmSignalStrength = parseGsmSignalStrength(hexString.substring(26, 28));
            parsedData.alarmStatus = parseAlarmStatus(hexString.substring(28, 30));
            break;

        case '18': // Alarm Data
            parsedData.type = 'alarm';
            parsedData.deviceId = hexString.substring(8, 24);
            parsedData.alarmType = parseAlarmType(hexString.substring(24, 26));
            parsedData.latitude = parseLatitude(hexString.substring(26, 34));
            parsedData.longitude = parseLongitude(hexString.substring(34, 42));
            parsedData.timestamp = parseTimestamp(hexString.substring(42, 50));
            break;

        default:
            throw new Error(`Unknown protocol number: ${protocolNumber}`);
    }

    return parsedData;
};

const parseLatitude = (hex) => {
    const decimal = parseInt(hex, 16);
    let latitude = (decimal / 30000) - 90; // Adjusted formula for latitude conversion
    if (latitude < -90) latitude = -90;
    if (latitude > 90) latitude = 90;
    return latitude.toFixed(6); // Truncate to 6 digits after decimal point and return as string
};

const parseLongitude = (hex) => {
    const decimal = parseInt(hex, 16);
    let longitude = (decimal / 30000) - 180; // Adjusted formula for longitude conversion
    if (longitude < -180) longitude = -180;
    if (longitude > 180) longitude = 180;
    return longitude.toFixed(6); // Truncate to 6 digits after decimal point and return as string
};

const parseTimestamp = (hex) => {
    const timestampHex = hex.substring(0, 8);
    const timestamp = parseInt(timestampHex, 16);
    return new Date(timestamp * 1000); // Assuming timestamp is in seconds
};

const parseSpeed = (hex) => {
    return parseInt(hex, 16);
};

const parseDirection = (hex) => {
    return parseInt(hex, 16);
};

const parseAltitude = (hex) => {
    return parseInt(hex, 16);
};

const parseStatus = (hex) => {
    const statusCodes = {
        '0000': 'Normal',
        '0001': 'Low Battery',
        '0002': 'Power Cut',
        // Add more status codes as needed
    };
    return statusCodes[hex] || 'Unknown';
};

const parseVoltageLevel = (hex) => {
    return parseInt(hex, 16);
};

const parseGsmSignalStrength = (hex) => {
    return parseInt(hex, 16);
};

const parseAlarmStatus = (hex) => {
    return parseInt(hex, 16);
};

const parseAlarmType = (hex) => {
    const alarmCodes = {
        '01': 'SOS',
        '02': 'Overspeed',
        '03': 'Power Cut',
        '04': 'Shock',
        '05': 'Geofence Breach',
        '06': 'Low Battery'
    };
    return alarmCodes[hex] || 'Unknown';
};

module.exports = { parseGT06Message };