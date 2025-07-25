const dbConnect = require('../config/db');
const Employee = require('../models/employeeModel');

exports.getEmployee = async (req, res, next) => {
    await dbConnect();
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return next(new AppError('Employee not found', 404));
        }
        res.json(employee);
    } catch (error) {
        next(error);
    }
};

exports.getAllEmployees = async (req, res, next) => {
    await dbConnect();
    try {
        const { position, search } = req.query;
        const query = {};
        if (position) query.position = position;
        if (search) query.name = { $regex: search, $options: 'i' };
        const employees = await Employee.find(query);

        res.json(employees);
    } catch (error) {
        next(error);
    }
};

exports.updateEmployee = async (req, res, next) => {
    await dbConnect();
    try {
        const { name, email, phoneNumber, position, department, joiningDate } = req.body;
        const updatedData = { name, email, phoneNumber, position, department, joiningDate };
        // if (!name || !email) {
        //     return next(new AppError('Name and email are required', 400));
        // }
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true, runValidators: true }
        );
        if (!employee) {
            return next(new AppError('Employee not found', 404));
        }
        res.json(employee);
    } catch (error) {
        next(error);
    }
};

exports.deleteEmployee = async (req, res, next) => {
    await dbConnect();
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return next(new AppError('Employee not found', 404));
        }
        res.json({ message: 'Employee deleted' });
    } catch (error) {
        next(error);
    }
};