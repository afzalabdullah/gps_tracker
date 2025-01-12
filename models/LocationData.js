const mongoose = require('mongoose');

const locationDataSchema = new mongoose.Schema({
    deviceId: { type: String },
    dateTime: { type: Date },
    latitude: { type: String },
    longitude: { type: String },
    speed: { type: Number },
    courseStatus: { type: Object },
    mcc: { type: Number },
    mnc: { type: Number },
    lac: { type: Number },
    cellId: { type: Number },
    serialNumber: { type: String }
});

const LocationData = mongoose.model('LocationData', locationDataSchema);
module.exports = LocationData;
