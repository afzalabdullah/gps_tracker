const mongoose = require('mongoose');

const alarmDataSchema = new mongoose.Schema({
    dateTime: { type: Date },
    satelliteInfo: {
        length: { type: Number },
        satellites: { type: Number }
    },
    latitude: { type: String },
    longitude: { type: String },
    speed: { type: Number },
    direction: { type: String },
    mcc: { type: Number },
    mnc: { type: Number },
    lac: { type: Number },
    cellId: { type: Number },
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

const AlarmData = mongoose.model('AlarmData', alarmDataSchema);
module.exports = AlarmData;
