const express = require('express');
const router = express.Router();
const {
    getAttendance,
    addAttendance,
    updateAttendance,
    getAttendanceById,
    getTodayAttendanceMerged,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/today', getTodayAttendanceMerged);
router.get('/', getAttendance);
router.get('/:id', getAttendanceById);
router.post('/', addAttendance);
router.patch('/:id', updateAttendance);

module.exports = router;
