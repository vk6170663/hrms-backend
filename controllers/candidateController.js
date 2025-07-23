const Candidate = require('../models/candidateModel');
const Employee = require('../models/employeeModel');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const AppError = require('../middleware/appError');

exports.createCandidate = async (req, res, next) => {
    try {
        const {
            fullName,
            email,
            phoneNumber,
            position,
            department,
            experience,
            resume,
            status
        } = req.body;

        // Validate required fields dynamically
        const requiredFields = ['fullName', 'email', 'phoneNumber', 'position', 'department', 'experience'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return next(
                new AppError(
                    `Missing required field(s): ${missingFields.join(', ')}`,
                    400
                )
            );
        }

        const resumePath = req.file ? req.file.path : null;

        const candidate = new Candidate({
            fullName,
            email,
            phoneNumber,
            position,
            department,
            experience,
            resume: resumePath,
            status
        });

        await candidate.save();
        res.status(201).json({ status: 'success', data: candidate });
    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return next(new AppError('Email already exists', 400));
        }
        next(error);
    }
};

exports.getCandidate = async (req, res, next) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return next(new AppError('Candidate not found', 404));
        }
        res.status(200).json({ status: 'success', data: candidate });
    } catch (error) {
        next(error);
    }
};

exports.getAllCandidates = async (req, res, next) => {
    try {
        const { status, search } = req.query;
        const query = {};

        if (status) query.status = status;
        if (search) query.fullName = { $regex: search, $options: 'i' };

        const candidates = await Candidate.find(query);
        res.status(200).json({ status: 'success', results: candidates.length, data: candidates });
    } catch (error) {
        next(error);
    }
};

exports.downloadResume = async (req, res, next) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return next(new AppError('Candidate not found', 404));
        }

        if (!candidate.resume) {
            return next(new AppError('No resume found', 404));
        }

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        page.drawText(`Resume Summary\n\nName: ${candidate.fullName}\nEmail: ${candidate.email}`, {
            x: 50,
            y: 700,
            size: 12
        });

        const pdfBytes = await pdfDoc.save();
        const filePath = path.join(__dirname, `../resumes/${candidate._id}.pdf`);

        await fs.writeFile(filePath, pdfBytes);

        res.download(filePath, `${candidate.fullName}_resume.pdf`, async (err) => {
            await fs.unlink(filePath).catch(() => { });
            if (err) return next(new AppError('Error downloading resume', 500));
        });
    } catch (error) {
        next(error);
    }
};


exports.updateCandidate = async (req, res, next) => {
    try {
        const { fullName, email, phoneNumber, position, department, experience } = req.body;

        const updateData = {
            fullName,
            email,
            phoneNumber,
            position,
            department,
            experience,
        };

        if (req.file) {
            updateData.resume = req.file.filename;
        }

        const updatedCandidate = await Candidate.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        if (!updatedCandidate) {
            return next(new AppError('Candidate not found', 404));
        }

        res.status(200).json({
            status: "success",
            data: updatedCandidate
        });

    } catch (error) {
        next(error);
    }
};

exports.updateCandidateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const candidateId = req.params.id;

        if (!status) {
            return next(new AppError('Status field is required', 400));
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return next(new AppError('Candidate not found', 404));
        }

        // If already selected, prevent double promotion
        const existingEmployee = await Employee.findOne({ email: candidate.email });
        console.log(existingEmployee);

        if (status === 'Selected' && existingEmployee) {
            return next(new AppError('This candidate is already an employee', 400));
        }

        candidate.status = status;
        await candidate.save();

        // Auto-create employee if status is 'Selected'
        if (status === 'Selected') {
            const newEmployee = new Employee({
                name: candidate.fullName,
                email: candidate.email,
                phoneNumber: candidate.phoneNumber,
                position: candidate.position,
                department: candidate.department
            });
            await newEmployee.save();
        }

        res.status(200).json({
            status: 'success',
            message: `Candidate status updated to '${status}'`,
            data: candidate
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.deleteCandidate = async (req, res, next) => {
    try {
        const candidate = await Candidate.findByIdAndDelete(req.params.id);
        if (!candidate) {
            return next(new AppError('Candidate not found', 404));
        }
        res.json({ message: 'Candidate deleted' });
    } catch (error) {
        next(error);
    }
};

exports.deleteAllCandidates = async (req, res, next) => {
    try {
        const result = await Candidate.deleteMany({});
        res.status(200).json({
            status: 'success',
            message: `${result.deletedCount} candidates deleted`
        });
    } catch (error) {
        next(error);
    }
};
