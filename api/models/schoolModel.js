const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    schoolName:{type: String, required: true},
    email:{type: String, required : true},
    ownerName:{type: String, required: true},
    schoolImg:{type: String, required: true},
    password:{type:String, required: true},
    createdAt:{type: Date, default: new Date()}
})

module.exports = mongoose.model("School", schoolSchema);