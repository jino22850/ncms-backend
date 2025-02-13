const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Register a new admin
exports.registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, email, password: hashedPassword });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login an admin
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id, username: admin. username },  process.env.JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({ message: 'Login successful', token });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, { password: 0 }); 
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Edit admin details
exports.editAdmin = async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (username) admin.username = username;
    if (email) admin.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin.password = hashedPassword;
    }

    await admin.save();
    res.status(200).json({ message: 'Admin updated successfully', admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an admin
exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Logout admin 
exports.logoutAdmin = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};


