const Attendance = require('../models/attendanceModel');
const Employee = require('../models/employeeModel');

const getTodayAttendanceMerged = async (req, res) => {
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
        }

        const [employees, attendance] = await Promise.all([
            Employee.find(employeeQuery),
            Attendance.find(attendanceQuery),
        ]);

        const attendanceMap = new Map();
        attendance.forEach((record) => {
            attendanceMap.set(record.employeeId.toString(), record);
        });

        const result = employees.map((emp) => {
            const attendanceRecord = attendanceMap.get(emp._id.toString());
            return {
                _id: attendanceRecord?._id || null,
                employee: emp,
                date: attendanceRecord?.date || today,
                status: attendanceRecord?.status || '',
                tasks: attendanceRecord?.tasks || '',
            };
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const getAttendance = async (req, res) => {
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
    try {
        const attendance = await Attendance.findById(req.params.id).populate('employeeId');
        if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addAttendance = async (req, res) => {
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
