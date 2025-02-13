const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');

// Create a new subcategory
const createSubCategory = async (req, res) => {
    try {
        const { subCategoryName, category, description } = req.body;

        const categoryDoc = await Category.findById(category);
        if (!categoryDoc) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const newSubCategory = new SubCategory({
            subCategoryName,
            category,
            description
        });

        await newSubCategory.save();
        res.status(201).json({ message: 'SubCategory created successfully', newSubCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all subcategories
const getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find().populate('category', 'name');
        res.status(200).json(subCategories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get subcategory by ID
const getSubCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const subCategory = await SubCategory.findById(id).populate('category', 'name');
        if (!subCategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }

        res.status(200).json(subCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const getSubCategoryByCategory = async (req, res) => {
    const { categoryId } = req.query;
  
    try {
      if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
      }
  
      const subCategories = await SubCategory.find({ category: categoryId });
  
      if (subCategories.length === 0) {
        return res.status(404).json({ message: "No subcategories found for this category" });
      }
  
      res.json(subCategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      res.status(500).json({ message: "Failed to fetch subcategories" });
    }
  };
  

// Update a subcategory by ID
const updateSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { subCategoryName, category, description } = req.body;

        const updatedSubCategory = await SubCategory.findByIdAndUpdate(
            id,
            { subCategoryName, category, description },
            { new: true }
        ).populate('category', 'Categoryname');

        if (!updatedSubCategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }

        res.status(200).json({ message: 'SubCategory updated successfully', updatedSubCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a subcategory by ID
const deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSubCategory = await SubCategory.findByIdAndDelete(id);
        if (!deletedSubCategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }

        res.status(200).json({ message: 'SubCategory deleted successfully', deletedSubCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createSubCategory,
    getAllSubCategories,
    getSubCategoryById,
    updateSubCategory,
    deleteSubCategory,
    getSubCategoryByCategory
};
