const parseGT06Message = (buffer) => {
    const hexString = buffer.toString('hex');

    // Ensure it's a valid GT06 message
    if (!hexString.startsWith('7878') && !hexString.startsWith('7979')) {
        throw new Error('Invalid GT06 message format');
    }

    // Extract protocol number
    const protocolNumber = hexString.substring(6, 8);
    const parsedData = { protocolNumber };

    // Parse based on protocol number
    switch (protocolNumber) {
        case '01': // Login Message
            parsedData.type = 'login';
            parsedData.deviceId = parseDeviceId(hexString.substring(8, 24));
            parsedData.serialNumber = hexString.substring(24, 28);
            parsedData.ack = '787805010001d9dc0d0a'; // Example acknowledgment
            break;

        case '12': // GPS Location Data
            parsedData.type = 'location';
            parsedData.deviceId = parseDeviceId(hexString.substring(8, 24));
            parsedData.dateTime = parseDateTime(hexString.substring(14, 26));
            parsedData.satelliteInfo = hexString.substring(26, 28);
            parsedData.latitude = parseLatitude(hexString.substring(28, 36));
            parsedData.longitude = parseLongitude(hexString.substring(36, 44));
            parsedData.speed = parseSpeed(hexString.substring(44, 46));
            parsedData.direction = parseDirection(hexString.substring(46, 50));
            parsedData.mcc = parseInt(hexString.substring(50, 54), 16);
            parsedData.mnc = parseInt(hexString.substring(54, 56), 16);
            parsedData.lac = parseInt(hexString.substring(56, 60), 16);
            parsedData.cellId = parseInt(hexString.substring(60, 66), 16);
            parsedData.serialNumber = hexString.substring(66, 70);
            break;

        case '13': // Status Information
            parsedData.type = 'status';
            parsedData.deviceId = parseDeviceId(hexString.substring(8, 24));
            parsedData.terminalInfo = parseTerminalInfo(hexString.substring(24, 26));
            parsedData.voltageLevel = parseVoltageLevel(hexString.substring(26, 28));
            parsedData.gsmSignalStrength = parseGsmSignalStrength(hexString.substring(28, 30));
            parsedData.alarmStatus = parseAlarmStatus(hexString.substring(30, 32));
            parsedData.serialNumber = hexString.substring(32, 36);
            break;

        case '16': // Heartbeat Packet
            parsedData.type = 'heartbeat';
            parsedData.deviceId = parseDeviceId(hexString.substring(8, 24));
            parsedData.voltageLevel = parseVoltageLevel(hexString.substring(24, 26));
            parsedData.gsmSignalStrength = parseGsmSignalStrength(hexString.substring(26, 28));
            parsedData.serialNumber = hexString.substring(28, 32);
            break;

        case '18': // Alarm Data
            parsedData.type = 'alarm';
            parsedData.deviceId = parseDeviceId(hexString.substring(8, 24));
            parsedData.alarmType = parseAlarmType(hexString.substring(24, 26));
            parsedData.latitude = parseLatitude(hexString.substring(26, 34));
            parsedData.longitude = parseLongitude(hexString.substring(34, 42));
            parsedData.timestamp = parseDateTime(hexString.substring(42, 50));
            parsedData.serialNumber = hexString.substring(50, 54);
            break;

        case '80': // Command Response
            parsedData.type = 'commandResponse';
            parsedData.deviceId = parseDeviceId(hexString.substring(8, 24));
            parsedData.commandContent = hexString.substring(24, hexString.length - 8); // Skip CRC and stop bits
            parsedData.serialNumber = hexString.substring(hexString.length - 8, hexString.length - 4);
            break;

        default:
            throw new Error(`Unknown protocol number: ${protocolNumber}`);
    }

    // Parse CRC and stop bits
    parsedData.crc = hexString.substring(hexString.length - 8, hexString.length - 4);
    parsedData.stopBit = hexString.substring(hexString.length - 4);

    return parsedData;
};

// Utility Functions
const parseDeviceId = (hex) => {
    // Converts the 8-byte hex IMEI to readable format
    return hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)).join('');
};

const parseDateTime = (hex) => {
    const year = parseInt(hex.substring(0, 2), 16) + 2000;
    const month = parseInt(hex.substring(2, 4), 16);
    const day = parseInt(hex.substring(4, 6), 16);
    const hour = parseInt(hex.substring(6, 8), 16);
    const minute = parseInt(hex.substring(8, 10), 16);
    const second = parseInt(hex.substring(10, 12), 16);

    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
};

const parseLatitude = (hex) => {
    const decimal = parseInt(hex, 16);
    return (decimal / 300000.0).toFixed(6); // GPS latitudes are scaled by 300,000
};

const parseLongitude = (hex) => {
    const decimal = parseInt(hex, 16);
    return (decimal / 300000.0).toFixed(6); // GPS longitudes are scaled by 300,000
};

const parseSpeed = (hex) => parseInt(hex, 16);

const parseDirection = (hex) => parseInt(hex, 16);

const parseTerminalInfo = (hex) => {
    const binary = parseInt(hex, 16).toString(2).padStart(8, '0');
    return {
        oilElectricity: binary[0] === '1' ? 'Disconnected' : 'Connected',
        gpsTracking: binary[1] === '1' ? 'On' : 'Off',
        alarmStatus: parseAlarmStatus(binary.substring(2, 5)),
        chargingStatus: binary[5] === '1' ? 'Charging' : 'Not Charging',
        accStatus: binary[6] === '1' ? 'High' : 'Low',
        activated: binary[7] === '1' ? 'Yes' : 'No',
    };
};

const parseVoltageLevel = (hex) => {
    const levels = ['No Power', 'Extremely Low', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];
    return levels[parseInt(hex, 16)] || 'Unknown';
};

const parseGsmSignalStrength = (hex) => {
    const strengths = ['No Signal', 'Extremely Weak', 'Weak', 'Good', 'Strong'];
    return strengths[parseInt(hex, 16)] || 'Unknown';
};

const parseAlarmStatus = (hex) => {
    const alarms = {
        '01': 'SOS',
        '02': 'Overspeed',
        '03': 'Power Cut',
        '04': 'Shock',
        '05': 'Geofence Breach',
        '06': 'Low Battery',
        '07': 'Fence In',
        '08': 'Fence Out',
    };
    return alarms[hex] || 'Unknown';
};

const parseAlarmType = parseAlarmStatus;

module.exports = { parseGT06Message };
