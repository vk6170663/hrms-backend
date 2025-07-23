const mongoose = require('mongoose');
const validator = require('validator');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Please tell us your name!"] },
    email: { type: String, required: [true, "Please tell us your email!"], unique: true, lowercase: true, validate: [validator.isEmail, "Please provide a valid email"] },
    phoneNumber: { type: String, required: [true, 'Please provide us your phone number!'] },
    position: { type: String, required: [true, "Please provide us position applied for!"], enum: ['Intern', 'Full Time', 'Junior', 'Senior', 'Team Lead'], default: 'Intern' },
    department: { type: String, required: [true, 'Please provide us department applied for!'] },
    joiningDate: { type: Date, required: [true, "Please provide joining date!"], default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Employee', employeeSchema);    