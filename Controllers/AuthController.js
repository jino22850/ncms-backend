const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "8h", // Token expires in 30 days
  });
};

// Register a new admin
exports.registerAdmin = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Create a new admin instance (password will be hashed automatically due to pre-save hook)
    const newAdmin = new Admin({
      username,
      email,
      password, // The password will be hashed in the schema's pre-save hook
      role, // Set role (defaults to 'Admin' if not provided)
    });

    // Save the new admin to the database
    await newAdmin.save();

    // Generate a token for the admin
    const token = generateToken(newAdmin._id);

    // Respond with success message and the generated token
    res.status(201).json({ message: "Admin registered successfully", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login an admin
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password.trim(), admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate a JWT token on successful login
    const token = generateToken(admin._id);

    // Respond with success message and the generated token
    res.status(200).json({ message: "Login successful", token,admin,role:admin.role });
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
      return res.status(404).json({ message: "Admin not found" });
    }

    if (username) admin.username = username;
    if (email) admin.email = email;
    if (password) {
      admin.password = await bcrypt.hash(password, 10);
    }

    await admin.save();
    res.status(200).json({ message: "Admin updated successfully", admin });
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
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify password for an action (Deleting coverage)
exports.verifyPassword = async (req, res) => {
  try {
    const { email, password, coverageNumber } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    const deletedCoverage = await Coverage.deleteOne({ coverageNumber });
    if (deletedCoverage.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Coverage not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Coverage deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Logout admin
exports.logoutAdmin = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};
