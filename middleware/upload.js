const multer = require('multer');
const path = require('path');

const sanitizeName = (name) => name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

// Storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/resumes/'); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = req.body.fullName ? sanitizeName(req.body.fullName) : 'unknown';
        const fileName = `${name}-${file.fieldname}${ext}`;
        console.log(file.fieldname);

        cb(null, fileName);
    }
});

// File filter (PDF only)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
