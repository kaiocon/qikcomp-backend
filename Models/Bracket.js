const mongoose = require('mongoose');

const bracketSchema = new mongoose.Schema({
    bracketName: { type: String, required: true, unique: true },
    competitors: { type: Array},
    matches: { type: Object},
    results: {type: Object},
    event: {type: String, required: true}
});

module.exports = mongoose.model('Bracket', bracketSchema);
//Declares model