const Event = require('../models/Event');
const SubCategory = require('../models/SubCategory');

// Add a new event
const addEvent = async (req, res) => {
    try {
        const { eventName, subCategory, description, date } = req.body;

        if (!eventName || !subCategory || !date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const subCategoryExists = await SubCategory.findById(subCategory);
        if (!subCategoryExists) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }

        const newEvent = new Event({ eventName, subCategory, description, date });

        await newEvent.save();
        res.status(201).json({ message: 'Event added successfully', event: newEvent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// Get all events
const getAllEvents = async (_req, res) => {
    try {
        const events = await Event.find()
            .populate('subCategory', 'subCategoryName') 
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// Get a single event by ID
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Event ID is required' });
        }

        const event = await Event.findById(id).populate('subCategory', 'subCategoryName');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// Update an event
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { eventName, subCategory, description, date } = req.body;

      
        if (!id || !eventName || !subCategory || !date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        
        const subCategoryExists = await SubCategory.findById(subCategory);
        if (!subCategoryExists) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }

        const updatedData = { eventName, subCategory, description, date };

        const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, { new: true })
            .populate('subCategory', 'subCategoryName');

        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// Delete an event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Event ID is required' });
        }

        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully', event: deletedEvent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

module.exports = {
    addEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
};
