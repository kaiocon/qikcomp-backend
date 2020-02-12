const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//Imports

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNum: { type: Number },
    country: {type: String },
    profileImage:{type: Buffer},
    academy:{type: String},
    winStatistics:{type: Object},
    adminPermissions: {type: Boolean}
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
            next();
        }
    });
}
});

module.exports = mongoose.model('User', userSchema);
//Declares model