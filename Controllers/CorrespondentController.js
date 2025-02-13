const Correspondent = require('../models/Correspondent');

// generate CorId
const generateCorId = async (districtName) => {
    const prefix = `COR-${districtName.substring(0, 2).toUpperCase()}`;
    const latestCorrespondent = await Correspondent.findOne({
      CorId: { $regex: `^${prefix}` }, 
    }).sort({ CorId: -1 }); 
  
    let nextNumber = 1;
    if (latestCorrespondent) {
      const currentNumber = parseInt(latestCorrespondent.CorId.slice(-3), 10);
      nextNumber = currentNumber + 1;
    }
  
    const paddedNumber = String(nextNumber).padStart(3, '0');
    return `${prefix}-${paddedNumber}`;
  };
  


// Add new correspondent
const addCorrespondent = async (req, res) => {
    try {
        const { name, initials, email, district, NIC, address, mobileNumber } = req.body;
        const CorId = await generateCorId(district);  
        const existingCorrespondent = await Correspondent.findOne({ email });
        if (existingCorrespondent) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newCorrespondent = new Correspondent({ name, initials, CorId, email, district, NIC, address, mobileNumber });
        await newCorrespondent.save();

        res.status(201).json({ message: 'Correspondent registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update correspondent
const updateCorrespondent = async (req, res) => {
    try {
        const { CorId } = req.params;
        const { name, initials, email, distric, NIC, address, mobileNumber} = req.body;

        const updatedCorrespondent = await Correspondent.findOneAndUpdate(
            { CorId },
            { name, initials,email, distric, NIC, address, mobileNumber },
            { new: true }
        );

        if (!updatedCorrespondent) {
            return res.status(404).json({ message: 'Correspondent not found' });
        }

        res.status(200).json({ message: 'Correspondent updated successfully', updatedCorrespondent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete correspondent
const deleteCorrespondent = async (req, res) => {
    try {
        const { CorId } = req.params;

        const deletedCorrespondent = await Correspondent.findOneAndDelete({ CorId });

        if (!deletedCorrespondent) {
            return res.status(404).json({ message: 'Correspondent not found' });
        }

        res.status(200).json({ message: 'Correspondent deleted successfully', deletedCorrespondent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all correspondents
const getAllCorrespondents = async (req, res) => {
    try {
        const correspondents = await Correspondent.find().sort({ CorId: -1 });
        res.status(200).json(correspondents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Get correspondent by CorId
const getCorrespondentById = async (req, res) => {
    try {
        const { CorId } = req.params;

        const correspondent = await Correspondent.findOne({ CorId });

        if (!correspondent) {
            return res.status(404).json({ message: 'Correspondent not found' });
        }

        res.status(200).json(correspondent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get the number of correspondents
const getCorrespondentCount = async (req, res) => {
    try {
        const count = await Correspondent.countDocuments();

        res.status(200).json({ message: 'Total correspondents count retrieved successfully', count });
    } catch (error) {
        console.error('Error in getCorrespondentCount:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


module.exports = {
    addCorrespondent,
    updateCorrespondent,
    deleteCorrespondent,
    getAllCorrespondents,
    getCorrespondentById,
    getCorrespondentCount
};
