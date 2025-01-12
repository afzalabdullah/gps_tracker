const mongoose = require('mongoose');

const heartbeatDataSchema = new mongoose.Schema({
    terminalInfo: {
        oilElectricity: { type: String },
        gpsTracking: { type: String },
        alarmStatus: { type: String },
        chargingStatus: { type: String },
        accStatus: { type: String },
        activated: { type: String }
    },
    voltageLevel: { type: String },
    gsmSignalStrength: { type: String },
    alarmStatus: { type: String },
    language: { type: String },
    serialNumber: { type: String }
});

const HeartbeatData = mongoose.model('HeartbeatData', heartbeatDataSchema);
module.exports = HeartbeatData;
