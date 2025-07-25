const dbConnect = require('../config/db');
const Attendance = require('../models/attendanceModel');
const Employee = require('../models/employeeModel');

// backend/api/attendance.js
const getTodayAttendanceMerged = async (req, res) => {
    await dbConnect();
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { status, search } = req.query;

        // Build employee query
        const employeeQuery = {};
        if (search) {
            employeeQuery.name = { $regex: search, $options: 'i' };
        }

        // Build attendance query
        const attendanceQuery = { date: { $gte: today } };
        if (status) {
            attendanceQuery.status = status;
        } else {
            attendanceQuery.status = { $in: ['Present', 'Absent'] };
        }

        // Fetch all employees and attendance records
        const [employees, attendance] = await Promise.all([
            Employee.find(employeeQuery).lean(),
            Attendance.find(attendanceQuery).lean(),
        ]);

        // Create a map of attendance records by employeeId
        const attendanceMap = new Map();
        attendance.forEach((record) => {
            attendanceMap.set(record.employeeId.toString(), record);
        });

        // Merge employees with attendance data
        const result = employees.map((emp) => {
            const attendanceRecord = attendanceMap.get(emp._id.toString());
            return {
                _id: attendanceRecord?._id || null,
                employee: {
                    _id: emp._id,
                    name: emp.name,
                    email: emp.email,
                    phoneNumber: emp.phoneNumber,
                    position: emp.position,
                    department: emp.department,
                    joiningDate: emp.joiningDate,
                    createdAt: emp.createdAt,
                },
                date: attendanceRecord?.date || today,
                status: attendanceRecord?.status || '',
                tasks: attendanceRecord?.tasks || '',
            };
        });

        // Filter out records that don't match the status filter (if provided)
        const filteredResult = status
            ? result.filter(record => record.status === status)
            : result.filter(record => record.status === 'Present' || record.status === 'Absent');

        res.json(filteredResult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const getAttendance = async (req, res) => {
    await dbConnect();
    try {
        const { status, search } = req.query;

        const query = {};

        if (status) query.status = status;

        if (search) {
            const employees = await Employee.find({ name: { $regex: search, $options: 'i' } });
            query.employeeId = { $in: employees.map((emp) => emp._id) };
        }

        const attendance = await Attendance.find(query).populate('employeeId');
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAttendanceById = async (req, res) => {
    await dbConnect();
    try {
        const attendance = await Attendance.findById(req.params.id).populate('employeeId');
        if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addAttendance = async (req, res) => {
    await dbConnect();
    const { employeeId, status, tasks } = req.body;

    if (!employeeId || !status || !tasks) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    try {
        const attendance = new Attendance({
            employeeId,
            status,
            tasks,
        });

        const saved = await attendance.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateAttendance = async (req, res) => {
    await dbConnect();
    const { status, tasks } = req.body;

    try {
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return res.status(404).json({ message: 'Not found' });

        if (status) attendance.status = status;
        if (tasks) attendance.tasks = tasks;

        const updated = await attendance.save();
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getTodayAttendanceMerged,
    getAttendance,
    getAttendanceById,
    addAttendance,
    updateAttendance,
};
