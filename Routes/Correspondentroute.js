const express = require('express');
const {
    addCorrespondent,
    updateCorrespondent,
    deleteCorrespondent,
    getAllCorrespondents,
    getCorrespondentById,
    getCorrespondentCount
} = require('../Controllers/CorrespondentController');

const verifyToken = require('../middleware/Auth');


const router = express.Router();

// Add a new correspondent
router.post('/add',  addCorrespondent);

// Update an existing correspondent
router.put('/update/:CorId', updateCorrespondent);

// Delete a correspondent
router.delete('/delete/:CorId', deleteCorrespondent);

// Get all correspondents
router.get('/all', getAllCorrespondents);

// Get a specific correspondent by CorId
router.get('/:CorId', getCorrespondentById);

// Get correspondent count
router.get('/correspondents/count', getCorrespondentCount);

module.exports = router;
