const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    competitorOne: { type: String, required: true},
    competitorTwo: { type: String, required: true},
    matchLocation: { type: String},
    competitorScore: { type: Array},
    results: {type: Object},
    bracketID: {type: String}
});

module.exports = mongoose.model('Match', matchSchema);
//Declares model