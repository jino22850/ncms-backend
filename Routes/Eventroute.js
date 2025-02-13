const express = require('express');
const router = express.Router();
const EventControler= require ('../Controllers/EventControler')


// Add a new event
router.post('/event/add', EventControler.addEvent);  

// Get all events
router.get('/event/all', EventControler.getAllEvents); 

// Get a specific event by ID
router.get('/event/:id', EventControler.getEventById); 

// Update an event by ID
router.put('/event/update/:id',EventControler. updateEvent, );    

// Delete an event by ID
router.delete('/event/delete/:id',EventControler. deleteEvent);         

module.exports = router;
