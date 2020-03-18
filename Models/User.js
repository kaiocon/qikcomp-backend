const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//Imports

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNum: { type: Number },
    birthDate: { type: Date, default: '1997-10-30'},
    country: {type: String, default: 'Scotland' },
    profileImage:{type: String, default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCzIhnAAAAG1BMVEXMzMyWlpacnJy+vr6jo6PFxcW3t7eqqqqxsbHbm8QuAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAiklEQVRYhe3QMQ6EIBAF0C+GSInF9mYTs+1ewRsQbmBlayysKefYO2asXbbYxvxHQj6ECQMAEREREf2NQ/fCtp5Zky6vtRMkSJEzhyISynWJnzH6Z8oQlzS7lEc/fLmmQUSvc16OrCPqRl1JePxQYo1ZSWVj9nxrrOb5esw+eXdvzTWfTERERHRXH4tWFZGswQ2yAAAAAElFTkSuQmCC'},
    academy:{type: String},
    winStatistics:{type: Object},
    adminPermissions: {type: Boolean, default: false},
    manages: {type: String, unique: true},
    age: {type: Number},
    _createdOn:{type: Date}
});
//Declares schema

userSchema.pre('save', function (next) {
if (this.isNew || this.isModified('password')){
    const document = this;
    bcrypt.hash(document.password, 10, (err, hashedPassword)=>{
        if (err){
            next(err)
        }
        else{
            document.password = hashedPassword;
            if (!this._createdOn) {
                this._createdOn = new Date();
            }
            next();
        }
    });
}


});

module.exports = mongoose.model('User', userSchema);
//Declares model