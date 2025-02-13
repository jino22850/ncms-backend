const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { 
            username, 
            email,
            password
        } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            username,
            email,
            password
        });

        
        await newAdmin.save();

        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;