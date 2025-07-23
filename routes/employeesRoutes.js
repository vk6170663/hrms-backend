const express = require('express');
const router = express.Router();
const { getEmployee, getAllEmployees, updateEmployee, deleteEmployee } = require('../controllers/employeesController');

const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:id', getEmployee);
router.get('/', getAllEmployees);
router.patch('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;