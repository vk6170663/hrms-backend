const Leave = require('../models/leaveModel');
const path = require('path');
const dbConnect = require('../config/db');

exports.createLeave = async (req, res) => {
    await dbConnect();
    try {
        const { employeeId, date, reason } = req.body;
        const documentPath = req.file.path;

        const leave = new Leave({
            employeeId,
            date: new Date(date),
            reason,
            documentPath,
        });

        await leave.save();
        res.status(201).json({
            _id: leave._id,
            employeeId: leave.employeeId,
            date: leave.date,
            status: leave.status,
            reason: leave.reason,
            documentPath: leave.documentPath,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.updateLeaveStatus = async (req, res) => {
    await dbConnect();
    try {
        const { status } = req.body;
        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        res.json({
            _id: leave._id,
            employeeId: leave.employeeId,
            date: leave.date,
            status: leave.status,
            documentPath: leave.documentPath,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getLeaves = async (req, res) => {
    await dbConnect();
    try {
        const { status, search, date } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }
        if (date) {
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);
            query.date = {
                $gte: selectedDate,
                $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000),
            };
        }

        const leaves = await Leave.find(query)
            .populate({
                path: 'employeeId',
                select: 'name email phoneNumber position department reason',
                match: search ? { name: { $regex: search, $options: 'i' } } : null,
            })
            .lean();

        const result = leaves
            .filter(leave => leave.employeeId)
            .map(leave => ({
                _id: leave._id,
                employee: {
                    _id: leave.employeeId._id,
                    name: leave.employeeId.name,
                    email: leave.employeeId.email,
                    phoneNumber: leave.employeeId.phoneNumber,
                    position: leave.employeeId.position,
                    department: leave.employeeId.department,
                },
                reason: leave.reason,
                date: leave.date,
                status: leave.status,
                documentPath: leave.documentPath,
            }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.downloadLeaveDocument = async (req, res) => {
    await dbConnect();
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        const filePath = leave.documentPath;
        res.download(filePath, path.basename(filePath), (err) => {
            if (err) {
                res.status(500).json({ message: 'Error downloading file' });
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
