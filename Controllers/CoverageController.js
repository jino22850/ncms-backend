const Coverage = require('../models/Coverage');
const Correspondent = require('../models/Correspondent');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');



// Add new coverage
const addCoverage = async (req, res) => {
    try {
        const {
            correspondent,
            coverageNumber,
            receivedDate,
            telecastDate,
            Category: category,
            event,
            subCategory,
            channel,
            medium,
            telecastType,
        } = req.body;

        
        if (!mongoose.Types.ObjectId.isValid(correspondent)) {
            return res.status(400).json({ message: 'Invalid Correspondent ID' });
        }

        const correspondentData = await Correspondent.findById(correspondent);
        if (!correspondentData) {
            return res.status(404).json({ message: 'Correspondent not found' });
        }

        
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ message: 'Invalid Category ID' });
        }

        const categoryData = await Category.findById(category);
        if (!categoryData) {
            return res.status(404).json({ message: 'Category not found' });
        }

       
        const existingCoverage = await Coverage.findOne({ coverageNumber });
        if (existingCoverage) {
            return res.status(400).json({ message: 'Coverage number already exists' });
        }

        const newCoverage = new Coverage({
            correspondent,
            coverageNumber,
            receivedDate,
            telecastDate,
            Category: category,
            event,
            subCategory,
            channel,
            medium,
            telecastType,
        });

        await newCoverage.save();

        res.status(201).json({ message: 'Coverage added successfully', newCoverage });
    } catch (error) {
        console.error('Error in addCoverage:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const getAllCoverages = async (req, res) => {
    try {
        // Get the current month and year
        const currentMonth = new Date().getMonth() + 1; // Months are 0-based in JavaScript, so add 1
        const currentYear = new Date().getFullYear();

        // Fetch all coverages with populated correspondent and category details
        const coverages = await Coverage.find({
            // Filter coverages by current month and year
            'receivedDate': {
                $gte: new Date(currentYear, currentMonth - 1, 1), // Start of the current month
                $lt: new Date(currentYear, currentMonth, 1), // Start of the next month (exclusive)
            }
        })
            .populate('correspondent', 'name CorId district')
            .populate('Category', 'name');

        if (coverages.length === 0) {
            return res.status(404).json({ message: 'No coverages found for the current month.' });
        }

        // Fetch all coverage numbers that already have a payment
        const paidCoverages = await Payment.find().distinct('coverageNumber');

        // Filter out coverages that already have payments
        const coveragesWithoutPayments = coverages.filter(coverage => !paidCoverages.includes(coverage.coverageNumber));

        if (coveragesWithoutPayments.length === 0) {
            return res.status(404).json({ message: 'No coverage data available without payments.' });
        }

        // Return the filtered coverages without payments
        res.status(200).json(coveragesWithoutPayments);
    } catch (error) {
        console.error('Error in getAllCoverages:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};




// Get all coverages
const getAllCoveragesRepo = async (req, res) => {
    try {
        const coverages = await Coverage.find()
            .populate('correspondent', 'name CorId district')
             .populate('Category', 'name');
        res.status(200).json(coverages);
    } catch (error) {
        console.error('Error in getAllCoverages:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const getAllCoverage = async (req, res) => {
    try {
        const { startDate, endDate, correspondentId } = req.query;

        // Validate required fields
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required.' });
        }

        // Convert date strings to Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        // Create filter object
        const filter = {
            telecastDate: {
                $gte: start,
                $lte: end,
            },
        };

        // If correspondentId is provided, add it to the filter
        if (correspondentId) {
            if (!mongoose.Types.ObjectId.isValid(correspondentId)) {
                return res.status(400).json({ message: 'Invalid Correspondent ID' });
            }
            filter.correspondent = correspondentId; // Fixed: Correctly filtering by correspondent ID
        }

        console.log('Filter:', filter); // Debugging: Log the query filter

        // Find coverages with filters
        const coverages = await Coverage.find(filter)
            .populate('correspondent', 'name CorId district')
            .populate('Category', 'name');

        if (coverages.length === 0) {
            return res.status(404).json({ message: 'No coverages found for the given criteria.' });
        }

        // Calculate payment amount for each coverage
        const coveragesWithPayments = coverages.map(coverage => {
            let paymentAmount = 0;

            if (coverage.telecastType === 'Not Telecast') {
                paymentAmount = 1000;
            } else if (coverage.telecastType === 'Without Voice') {
                paymentAmount = 2000;
            } else if (coverage.telecastType === 'With Voice') {
                paymentAmount = 3000;
            }

            return { ...coverage.toObject(), paymentAmount };
        });

        res.status(200).json(coveragesWithPayments);
    } catch (error) {
        console.error('Error in getAllCoverage:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


// Get coverage by coverage number
const getCoverageByNumber = async (req, res) => {
    try {
        const { coverageNumber } = req.params;

        const coverage = await Coverage.findOne({ coverageNumber })
            .populate('correspondent', 'name CorId ')

        if (!coverage) {
            return res.status(404).json({ message: 'Coverage not found' });
        }

        res.status(200).json(coverage);
    } catch (error) {
        console.error('Error in getCoverageByNumber:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const getCoveragesByTelecastDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required.' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        const coverages = await Coverage.find({
            telecastDate: {
                $gte: start,
                $lte: end,
            },
        })
        .select('coverageNumber receivedDate telecastType telecastDate channel') // Select specific fields
        .populate('correspondent', 'name CorId')
        .populate('Category', 'name')
        .populate('event', 'eventName')
        .populate('subCategory', 'SubCategoryName');


        res.status(200).json({
            message: `Coverages from ${startDate} to ${endDate}`,
            count: coverages.length,
            coverages,
        });
    } catch (error) {
        console.error('Error in getCoveragesByTelecastDate:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const updateCoverage = async (req, res) => {
    try {
        const { coverageNumber } = req.params;
        const {
            correspondent,
            fileNumber,
            receivedDate,
            telecastDate,
            event,
            subCategory,
            channel,
            medium,
            telecastStatus,
            telecastType,
            id,
        } = req.body;

        // Check if the coverage has already been paid for
        const existingPayment = await Payment.findOne({ coverageNumber });

        if (existingPayment) {
            return res.status(403).json({ message: 'This coverage cannot be edited as a payment has already been generated.' });
        }

        // Validate telecast status
        if (telecastStatus === 'Telecast' && !telecastType) {
            return res.status(400).json({ message: 'Telecast type must be specified when telecast status is "Telecast".' });
        }

        // Validate correspondent
        const correspondentid = await Correspondent.findOne({ _id: correspondent });
        if (!correspondentid) return res.status(404).json({ message: 'Correspondent not found' });

        // Prepare updated data
        const updatedData = {
            correspondent: correspondentid._id,
            fileNumber,
            receivedDate,
            telecastDate,
            event,
            subCategory,
            channel,
            medium,
            telecastStatus,
            telecastType,
            id,
        };

        // Update the coverage
        const updatedCoverage = await Coverage.findOneAndUpdate(
            { coverageNumber },
            updatedData,
            { new: true, runValidators: true }
        ).populate('correspondent', 'name CorId');

        if (!updatedCoverage) {
            return res.status(404).json({ message: 'Coverage not found' });
        }

        res.status(200).json({ message: 'Coverage updated successfully', updatedCoverage });
    } catch (error) {
        console.error('Error in updateCoverage:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


// Delete a coverage
const deleteCoverage = async (req, res) => {
    try {
        const { coverageNumber } = req.params;
        const deletedCoverage = await Coverage.findOneAndDelete({ coverageNumber });

        if (!deletedCoverage) {
            return res.status(404).json({ message: 'Coverage not found' });
        }

        res.status(200).json({ message: 'Coverage deleted successfully', deletedCoverage });
    } catch (error) {
        console.error('Error in deleteCoverage:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const getCoveragesCurrentMonth = async (req, res) => {
    try {
        const currentMonth = new Date().getMonth();  
        const currentYear = new Date().getFullYear();

        const coverages = await Coverage.find({
          
            receivedDate: {
                $gte: new Date(currentYear, currentMonth, 1), 
                $lt: new Date(currentYear, currentMonth + 1, 0) 
            }
        })
        .populate('correspondent', 'name CorId district')
        .populate('Category', 'name');

        // Send the total count of coverages for the current month
        res.status(200).json({
            message: `Total coverages for ${currentMonth + 1}-${currentYear}`,
            count: coverages.length,
            coverages
        });
    } catch (error) {
        console.error('Error in getCoveragesCurrentMonth:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const filterCoverages = async (req, res) => {
    try {
        const { startDate, endDate, correspondent } = req.query;

        // Validate date inputs
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required.' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        const query = {};

        if (correspondent) {
            const correspondentDoc = await Correspondent.findById({ _id: correspondent });
            if (!correspondentDoc) {
                return res.status(400).json({ message: 'Correspondent not found.' });
            }
            query.correspondent = correspondentDoc._id; 
        }

        const coverages = await Coverage.find({
            telecastDate: {
                $gte: start,
                $lte: end,
            },
            ...query,
        })
            .select('coverageNumber receivedDate telecastType telecastDate channel') 
            .populate('correspondent', 'name CorId') 
            .populate('Category', 'name') 
            .populate('event', 'eventName')
            .populate('subCategory', 'SubCategoryName');

        const response = coverages.map((coverage) => ({
            coverageNumber: coverage.coverageNumber,
            receivedDate: coverage.receivedDate,
            telecastType: coverage.telecastType,
            telecastDate: coverage.telecastDate,
            channel: coverage.channel,
            correspondent: {
                name: coverage.correspondent?.name,
                CorId: coverage.correspondent?.CorId,
            },
            Category: coverage.Category?.name, 
            event: coverage.event?.eventName,
            subCategory: coverage.subCategory?.SubCategoryName,
        }));

        res.status(200).json({
            message: `Coverages from ${startDate} to ${endDate}`,
            count: response.length,
            coverages: response,
        });
    } catch (error) {
        console.error('Error in filterCoverages:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const getCoverageCountByCorrespondent = async (req, res) => {
    try {
        const { startDate, endDate } = req.query; // Get date range from query parameters

        // Convert start and end dates to ISO format for filtering
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Ensure it includes the entire end date

        const coverageCounts = await Coverage.aggregate([
            {
                $match: {
                    telecastDate: { $gte: start, $lte: end } // Filter coverages based on telecast date
                }
            },
            {
                $group: {
                    _id: "$correspondent",
                    totalCoverage: { $sum: 1 },
                    voiceTelecast: {
                        $sum: {
                            $cond: [{ $and: [{ $eq: ["$telecastStatus", "Telecast"] }, { $eq: ["$telecastType", "Voice"] }] }, 1, 0]
                        }
                    },
                    withoutVoiceTelecast: {
                        $sum: {
                            $cond: [{ $and: [{ $eq: ["$telecastStatus", "Telecast"] }, { $eq: ["$telecastType", "Without Voice"] }] }, 1, 0]
                        }
                    },
                    notTelecast: {
                        $sum: {
                            $cond: [{ $ne: ["$telecastStatus", "Telecast"] }, 1, 0]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "correspondents",
                    localField: "_id",
                    foreignField: "_id",
                    as: "correspondentDetails"
                }
            },
            {
                $unwind: "$correspondentDetails"
            },
            {
                $project: {
                    _id: 0,
                    correspondentId: "$correspondentDetails._id",
                    correspondentName: "$correspondentDetails.name",
                    CorId: "$correspondentDetails.CorId",
                    District: "$correspondentDetails.district",
                    totalCoverage: 1,
                    voiceTelecast: 1,
                    withoutVoiceTelecast: 1,
                    notTelecast: 1,
                    totalPayment: {
                        $add: [
                            { $multiply: ["$voiceTelecast", 3000] },
                            { $multiply: ["$withoutVoiceTelecast", 2000] },
                            { $multiply: ["$notTelecast", 1000] }
                        ]
                    }
                }
            }
        ]);

        res.status(200).json(coverageCounts);
    } catch (error) {
        console.error("Error in getCoverageCountByCorrespondent:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



const getCoverageCountsByType = async (req, res) => {
    try {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const coverages = await Coverage.find({
            receivedDate: {
                $gte: new Date(currentYear, currentMonth, 1),
                $lt: new Date(currentYear, currentMonth + 1, 0),
            }
        });

        // Count different types
        const counts = {
            voiceTelecast: 0,
            withoutVoiceTelecast: 0,
            notTelecast: 0,
        };

        coverages.forEach(coverage => {
            if (coverage.telecastStatus === "Telecast") {
                if (coverage.telecastType === "Voice") {
                    counts.voiceTelecast++;
                } else if (coverage.telecastType === "Without Voice") {
                    counts.withoutVoiceTelecast++;
                }
            } else {
                counts.notTelecast++;
            }
        });

        res.status(200).json({
            message: `Coverage breakdown for ${currentMonth + 1}-${currentYear}`,
            ...counts,
        });
    } catch (error) {
        console.error('Error in getCoverageCountsByType:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const getCoveragesByDistrict = async (req, res) => {
    try {
        const { district, startDate, endDate } = req.query; // Get district, startDate, and endDate from query parameters

        if (!district) {
            return res.status(400).json({ message: "District is required" });
        }

        // If startDate or endDate are provided, convert them to Date objects
        let start = startDate ? new Date(startDate) : null;
        let end = endDate ? new Date(endDate) : null;

        if (start && isNaN(start)) {
            return res.status(400).json({ message: "Invalid start date" });
        }

        if (end && isNaN(end)) {
            return res.status(400).json({ message: "Invalid end date" });
        }

        const coverages = await Coverage.find()
            .populate({
                path: "correspondent",
                select: "name CorId district",
            })
            .populate({
                path: "Category",
                select: "name",
            });

        // Filter coverages where the correspondent's district matches the query
        const filteredCoverages = coverages.filter(coverage => {
            const correspondentDistrict = coverage.correspondent?.district?.toLowerCase();
            const coverageTelecastDate = new Date(coverage.telecastDate);

            // Check district match
            const isDistrictMatch = correspondentDistrict === district.toLowerCase();

            // Check if the telecast date is within the specified range
            const isWithinDateRange = (!start || coverageTelecastDate >= start) && (!end || coverageTelecastDate <= end);

            return isDistrictMatch && isWithinDateRange;
        });

        res.status(200).json(filteredCoverages);
    } catch (error) {
        console.error("Error in getCoveragesByDistrict:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


// const getCoveragePaymentsByDistrict = async (req, res) => {
//     try {
//         const { district, startDate, endDate } = req.query;

//         // Validate required fields
//         if (!district) {
//             return res.status(400).json({ message: 'District is required.' });
//         }

//         if (!startDate || !endDate) {
//             return res.status(400).json({ message: 'Start date and end date are required.' });
//         }

//         // Convert date strings to Date objects
//         const start = new Date(startDate);
//         const end = new Date(endDate);

//         if (isNaN(start) || isNaN(end)) {
//             return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
//         }

//         // Find coverages by district and date range
//         const coverages = await Coverage.find({
//             telecastDate: {
//                 $gte: start,
//                 $lte: end,
//             },
//         })
//             .populate('correspondent', 'name CorId district') // Populate correspondent data
//             .populate('Category', 'name') // Populate category data
//             .populate('event', 'eventName') // Populate event data
//             .populate('subCategory', 'SubCategoryName') // Populate subCategory data
//             .where('correspondent.district')
//             .equals(district); // Filter by district

//         if (coverages.length === 0) {
//             return res.status(404).json({ message: 'No coverages found for the given district and date range.' });
//         }

//         // Calculate total coverage amount
//         let totalCoverageAmount = 0;
//         coverages.forEach(coverage => {
//             if (coverage.telecastType === 'Not telecast') {
//                 totalCoverageAmount += 1000;
//             } else if (coverage.telecastType === 'Without voice') {
//                 totalCoverageAmount += 2000;
//             } else if (coverage.telecastType === 'With voice') {
//                 totalCoverageAmount += 3000;
//             }
//         });

//         // Return the filtered coverages and total amount
//         res.status(200).json({
//             message: `Coverages for district ${district} from ${startDate} to ${endDate}`,
//             count: coverages.length,
//             totalCoverageAmount,
//             coverages,
//         });
//     } catch (error) {
//         console.error('Error in getCoveragesByDistrict:', error.message);
//         res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };





module.exports = {
    addCoverage,
    getAllCoverages,
    getAllCoverage,
    getAllCoveragesRepo,
    getCoverageByNumber,
    getCoveragesByTelecastDate,
    filterCoverages,
    updateCoverage,
    deleteCoverage,
    getCoveragesCurrentMonth,
    getCoverageCountByCorrespondent,
    getCoveragesByDistrict,
    // getCoveragePaymentsByDistrict,
    getCoverageCountsByType
   
};



