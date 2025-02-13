const Category = require('../models/Category');

// Add a new category
const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const newCategory = new Category({ name, description });
        await newCategory.save();

        res.status(201).json({ message: 'Category added successfully', newCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a specific category by name
const getCategoryByName = async (req, res) => {
    try {
        const { name } = req.params;

        const category = await Category.findOne({ name });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true } 
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category updated successfully', updatedCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Delete a category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully', deletedCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    addCategory,
    getAllCategories,
    getCategoryByName,
    updateCategory,
    deleteCategory
};
