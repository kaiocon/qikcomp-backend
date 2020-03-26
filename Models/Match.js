const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    competitorOne: { type: String, required: true},
    competitorTwo: { type: String, required: true, default: 'OPENSPACE'},
    matchLocation: { type: String, default: 'TBC'},
    competitorScore: { type: Array, default: [0,0]},
    results: {type: Object},
    bracketID: {type: String, required: true}
});

module.exports = mongoose.model('Match', matchSchema);
//Declares model