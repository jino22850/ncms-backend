const express = require('express');
const {
    addCategory,
    getAllCategories,
    getCategoryByName,
    updateCategory,
    deleteCategory,
} = require('../Controllers/CategoryController');
const verifyToken = require('../middleware/Auth');

const router = express.Router();

// Add a new category
router.post('/category/add',verifyToken, addCategory);

// Get all categories 
router.get('/category/all',verifyToken, getAllCategories);

// Get a specific category by name 
router.get('/category/:name', verifyToken, getCategoryByName);

// Update a category by ID
router.put('/category/:id', verifyToken, updateCategory);

// Delete a category by ID 
router.delete('/category/delete/:id',verifyToken,deleteCategory);

module.exports = router;