const express = require('express');
const router = express.Router();
const SubCategoryController = require('../Controllers/SubCategoryController');

// Route to create a new subcategory
router.post('/SubCategory/create', SubCategoryController.createSubCategory);

// Route to get all subcategories
router.get('/SubCategory/all', SubCategoryController.getAllSubCategories);

router.get('/SubCategry/category' , SubCategoryController.getSubCategoryByCategory);

// Route to get a subcategory by ID
router.get('/SubCategory/:id', SubCategoryController.getSubCategoryById);

// Route to update a subcategory by ID
router.put('/SubCategory/:id', SubCategoryController.updateSubCategory);

// Route to delete a subcategory by ID
router.delete('/SubCategory/:id', SubCategoryController.deleteSubCategory);

module.exports = router;
