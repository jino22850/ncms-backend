const express = require('express');
const {
    addDistrict,
    getAllDistricts,
    getDistrictByName,
    updateDistrict,
    deleteDistrict
} = require('../Controllers/DistrictController');

const router = express.Router();

// Add a new district
router.post('/district/add', addDistrict);

// Get all districts
router.get('/district/all', getAllDistricts);

// Get a specific district by name
router.get('/district/:name', getDistrictByName);

// Update a district
router.put('/district/update/:name', updateDistrict);

// Delete a district
router.delete('/district/delete/:name', deleteDistrict);

module.exports = router;
