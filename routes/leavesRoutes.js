const express = require('express');
const router = express.Router();

const Employee = require('../models/employeeModel');
const Attendance = require('../models/attendanceModel');
const leaveUpload = require('../middleware/leaveUpload');
const fs = require('fs');
const { createLeave, updateLeaveStatus, getLeaves, downloadLeaveDocument } = require("../controllers/leaveController");

const checkPresentStatus = async (req, res, next) => {
    const { employeeId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
        employeeId,
        date: { $gte: today },
        status: 'Present',
    });

    if (!attendance) {
        return res.status(400).json({ message: 'Only employees with Present status can request leave' });
    }
    next();
};

router.post('/', leaveUpload.single('document'), checkPresentStatus, createLeave);

router.put('/:id', updateLeaveStatus);

router.get('/', getLeaves);

router.get('/:id/download', downloadLeaveDocument);

module.exports = router;
