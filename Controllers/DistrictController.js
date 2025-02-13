const District = require('../models/District');

// Add a new district
const addDistrict = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existingDistrict = await District.findOne({ name });
        if (existingDistrict) {
            return res.status(400).json({ message: 'District already exists' });
        }

        const newDistrict = new District({ name, description });
        await newDistrict.save();

        res.status(201).json({ message: 'District added successfully', newDistrict });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all districts
const getAllDistricts = async (req, res) => {
    try {
        const districts = await District.find();
        res.status(200).json(districts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a specific district by name
const getDistrictByName = async (req, res) => {
    try {
        const { name } = req.params;

        const district = await District.findOne({ name });

        if (!district) {
            return res.status(404).json({ message: 'District not found' });
        }

        res.status(200).json(district);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a district
const updateDistrict = async (req, res) => {
    try {
        const { name } = req.params;
        const { description } = req.body;

        const updatedDistrict = await District.findOneAndUpdate(
            { name },
            { description },
            { new: true }
        );

        if (!updatedDistrict) {
            return res.status(404).json({ message: 'District not found' });
        }

        res.status(200).json({ message: 'District updated successfully', updatedDistrict });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a district
const deleteDistrict = async (req, res) => {
    try {
        const { name } = req.params;

        const deletedDistrict = await District.findOneAndDelete({ name });

        if (!deletedDistrict) {
            return res.status(404).json({ message: 'District not found' });
        }

        res.status(200).json({ message: 'District deleted successfully', deletedDistrict });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    addDistrict,
    getAllDistricts,
    getDistrictByName,
    updateDistrict,
    deleteDistrict
};
