const express = require('express');
const router = express.Router();
const {
    createCandidate,
    getCandidate,
    getAllCandidates,
    toEmployee,
    downloadResume,
    updateCandidate,
    deleteCandidate,
    updateCandidateStatus,
    deleteAllCandidates,
} = require('../controllers/candidateController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protect all routes with JWT authentication
router.use(protect);

// Create a candidate
router.post('/', upload.single('resume'), createCandidate);

// Get a single candidate by ID
router.get('/:id', getCandidate);

// Get all candidates with optional filters/search
router.get('/', getAllCandidates);

// Download candidate resume as PDF
router.get('/:id/pdf', downloadResume);

// Update a candidate
router.patch('/:id', upload.single('resume'), updateCandidate);

// Convert candidate to employee
router.patch('/:id/status', updateCandidateStatus);

// Delete all candidates
router.delete('/delete-all', deleteAllCandidates);

// Delete a candidate
router.delete('/:id', deleteCandidate);



module.exports = router;