const mongoose = require('mongoose');

const academySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    instructor: { type: String, required: true },
    phoneNum: { type: Number, required: true },
    country: {type: String, required: true  },
    about: {type: String, required: true},
    website: {type: String, default: 'N/A'},
    profileImage: {type: String, default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCzIhnAAAAG1BMVEXMzMyWlpacnJy+vr6jo6PFxcW3t7eqqqqxsbHbm8QuAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAiklEQVRYhe3QMQ6EIBAF0C+GSInF9mYTs+1ewRsQbmBlayysKefYO2asXbbYxvxHQj6ECQMAEREREf2NQ/fCtp5Zky6vtRMkSJEzhyISynWJnzH6Z8oQlzS7lEc/fLmmQUSvc16OrCPqRl1JePxQYo1ZSWVj9nxrrOb5esw+eXdvzTWfTERERHRXH4tWFZGswQ2yAAAAAElFTkSuQmCC'},
    affiliation: {type: String, default: 'N/A'},
    winStatistics: {type: Object},
    competitorCount: {type: Number, default: 1},
    competitors: {type: Array},
    _createdOn:{type: Date},
    manager: {type: String, required: true, unique: true}
});

academySchema.pre('save', function (next) {
     if (!this._createdOn) {
     this._createdOn = new Date();
     }
     next();
});

module.exports = mongoose.model('Academy', academySchema);
//Declares model