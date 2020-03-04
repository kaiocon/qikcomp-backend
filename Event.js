const eventSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Event', eventSchema);
//Declares model