const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    info: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    eventStart: { type: Date, required: true },
    competitorBrackets: {type: Object },
    bannerImage:{type: String, required: true},
    WinResults:{type: Object}
});

module.exports = mongoose.model('Event', eventSchema);
//Declares model