const mongoose = require('mongoose');
const validator = require('validator');

const candidateSchema = new mongoose.Schema({
    fullName: { type: String, required: [true, "Please tell us your name!"] },
    email: { type: String, required: [true, "Please tell us your email!"], unique: true, lowercase: true, validate: [validator.isEmail, "Please provide a valid email"] },
    phoneNumber: { type: String, required: [true, "Please provide us your phone number!"] },
    position: { type: String, required: [true, "Please provide us position applied for!"], enum: ['Intern', 'Full Time', 'Junior', 'Senior', 'Team Lead'], default: 'Intern' },
    department: { type: String, required: [true, "Please provide us department applied for!"] },
    experience: { type: String, required: [true, "Please provide us your experience!,"] },
    resume: { type: String, required: [true, "Please provide us your resume!"] },
    status: { type: String, enum: ['New', 'Scheduled', 'Ongoing', 'Selected', 'Rejected'], default: 'New' },
});

module.exports = mongoose.model('Candidate', candidateSchema);