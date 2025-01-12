const mongoose = require('mongoose');

const statusDataSchema = new mongoose.Schema({
    terminalInfo: { type: Object },
    voltageLevel: { type: String },
    gsmSignalStrength: { type: String },
    alarmStatus: { type: String },
    serialNumber: { type: String }
});

const StatusData = mongoose.model('StatusData', statusDataSchema);
module.exports = StatusData;
