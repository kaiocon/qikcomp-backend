const mongoose = require('mongoose');

const affiliationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    about: {type: String, required: true},
    academies: {type: Array},
    profileImage: {type: String, default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCzIhnAAAAG1BMVEXMzMyWlpacnJy+vr6jo6PFxcW3t7eqqqqxsbHbm8QuAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAiklEQVRYhe3QMQ6EIBAF0C+GSInF9mYTs+1ewRsQbmBlayysKefYO2asXbbYxvxHQj6ECQMAEREREf2NQ/fCtp5Zky6vtRMkSJEzhyISynWJnzH6Z8oQlzS7lEc/fLmmQUSvc16OrCPqRl1JePxQYo1ZSWVj9nxrrOb5esw+eXdvzTWfTERERHRXH4tWFZGswQ2yAAAAAElFTkSuQmCC'},
    winStatistics: {type: Object},
    _createdOn:{type: Date},
    manager: {type: String, required: true, unique: true}
});

affiliationSchema.pre('save', function (next) {
    if (!this._createdOn) {
        this._createdOn = new Date();
    }
    next();
});

module.exports = mongoose.model('Affiliation', affiliationSchema);
//Declares model