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
            parsedData.dateTime = parseDateTime(hexString.substring(8, 20));
            parsedData.satelliteInfo = parseSatelliteInfo(hexString.substring(20, 22));
            parsedData.latitude = parseLatitude(hexString.substring(22, 30));
            parsedData.longitude = parseLongitude(hexString.substring(30, 38));
            parsedData.speed = parseSpeed(hexString.substring(38, 40));
            parsedData.courseStatus = parseCourseStatus(hexString.substring(40, 44));
            parsedData.mcc = parseInt(hexString.substring(44, 48), 16);
            parsedData.mnc = parseInt(hexString.substring(48, 50), 16);
            parsedData.lac = parseInt(hexString.substring(50, 54), 16);
            parsedData.cellId = parseInt(hexString.substring(54, 60), 16);
            parsedData.serialNumber = hexString.substring(60, 64);
            break;

        case '13': // Status Information
            parsedData.type = 'status';
            parsedData.terminalInfo = parseTerminalInfo(hexString.substring(24, 26));
            parsedData.voltageLevel = parseVoltageLevel(hexString.substring(26, 28));
            parsedData.gsmSignalStrength = parseGsmSignalStrength(hexString.substring(28, 30));
            parsedData.alarmStatus = parseAlarmStatus(hexString.substring(30, 32));
            parsedData.serialNumber = hexString.substring(32, 36);
            break;

        case '16': // Heartbeat Packet
            parsedData.type = 'heartbeat';
            parsedData.terminalInfo = parseTerminalInfo(hexString.substring(8, 10));
            parsedData.voltageLevel = parseVoltageLevel(hexString.substring(10, 12));
            parsedData.gsmSignalStrength = parseGsmSignalStrength(hexString.substring(12, 14));
            parsedData.alarmStatus = parseAlarmStatus(hexString.substring(14, 16));
            parsedData.language = parseLanguage(hexString.substring(16, 18));
            parsedData.serialNumber = hexString.substring(18, 22);
            break;

        case '18': // Alarm Data
            parsedData.type = 'alarm';
            parsedData.dateTime = parseDateTime(hexString.substring(8, 20));
            parsedData.satelliteInfo = parseInt(hexString.substring(20, 22), 16);
            parsedData.latitude = parseLatitude(hexString.substring(22, 30));
            parsedData.longitude = parseLongitude(hexString.substring(30, 38));
            parsedData.speed = parseSpeed(hexString.substring(38, 40));
            parsedData.direction = parseDirection(hexString.substring(40, 44));
            parsedData.mcc = parseInt(hexString.substring(44, 48), 16);
            parsedData.mnc = parseInt(hexString.substring(48, 50), 16);
            parsedData.lac = parseInt(hexString.substring(50, 54), 16);
            parsedData.cellId = parseInt(hexString.substring(54, 60), 16);
            parsedData.terminalInfo = parseTerminalInfo(hexString.substring(60, 62));
            parsedData.voltageLevel = parseVoltageLevel(hexString.substring(62, 64));
            parsedData.gsmSignalStrength = parseGsmSignalStrength(hexString.substring(64, 66));
            parsedData.alarmStatus = parseAlarmStatus(hexString.substring(66, 68));
            parsedData.language = parseLanguage(hexString.substring(68, 70));
            parsedData.serialNumber = hexString.substring(70, 74);
            break;

        case '80': // Command Response
            parsedData.type = 'commandResponse';
            parsedData.deviceId = parseDeviceId(hexString.substring(8, 24));
            parsedData.commandContent = hexString.substring(24, hexString.length - 8); // Skip CRC and stop bits
            parsedData.serialNumber = hexString.substring(hexString.length - 8, hexString.length - 4);
            break;

        default:
            parsedData.type = 'unknown';
            parsedData.messageContent = hexString.substring(8, hexString.length - 8); // Skip CRC and stop bits
            break;
    }

    // Parse CRC and stop bits
    parsedData.crc = hexString.substring(hexString.length - 8, hexString.length - 4);
    parsedData.stopBit = hexString.substring(hexString.length - 4);

    return parsedData;
};

// Utility Functions
const parseDeviceId = (hex) => {
    // Parse IMEI (8 bytes in BCD format)
    return hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16).toString(10).padStart(2, '0')).join('');
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

const parseSatelliteInfo = (hex) => {
    const length = parseInt(hex.substring(0, 1), 16);
    const satellites = parseInt(hex.substring(1, 2), 16);
    return { length, satellites };
};

const parseLatitude = (hex) => {
    const decimal = parseInt(hex, 16);
    return (decimal / 300000.0).toFixed(6); // Latitude scaling
};

const parseLongitude = (hex) => {
    const decimal = parseInt(hex, 16);
    return (decimal / 300000.0).toFixed(6); // Longitude scaling
};

const parseSpeed = (hex) => parseInt(hex, 16);

const parseCourseStatus = (hex) => {
    const byte1 = parseInt(hex.substring(0, 2), 16).toString(2).padStart(8, '0');
    const byte2 = parseInt(hex.substring(2, 4), 16);

    return {
        gpsRealTime: byte1[2] === '1',
        gpsPositioned: byte1[3] === '1',
        eastLongitude: byte1[4] === '0',
        northLatitude: byte1[5] === '1',
        course: byte2
    };
};

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
        '00': 'Normal',
        '01': 'SOS',
        '02': 'Power Cut',
        '03': 'Shock',
        '04': 'Fence In',
        '05': 'Fence Out',
    };
    return alarms[hex] || 'Unknown';
};

const parseLanguage = (hex) => {
    const languages = {
        '01': 'Chinese',
        '02': 'English'
    };
    return languages[hex] || 'Unknown';
};

module.exports = { parseGT06Message };