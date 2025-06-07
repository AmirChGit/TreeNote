// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');

// Define the schema for the Leaf model
// This schema represents a note or content attached to the tree structure
const leafSchema = new mongoose.Schema({
    // X coordinate of the leaf
    // Required number that determines the horizontal position
    x: { type: Number, required: true },

    // Y coordinate of the leaf
    // Required number that determines the vertical position
    y: { type: Number, required: true },

    // Content of the note
    // Required string that contains the actual note text
    note: { type: String, required: true },

    // Angle of the leaf relative to its branch
    // Required number that determines the orientation
    branchAngle: { type: Number, required: true },

    // Index of this leaf among all leaves on the same branch
    // Required number for ordering leaves
    leafIndex: { type: Number, required: true },

    // Total number of leaves on the same branch
    // Required number for calculating leaf spacing
    totalLeaves: { type: Number, required: true },

    // Scale factor for the leaf
    // Required number that determines the size of the leaf
    scale: { type: Number, required: true },

    // Rotation angle of the leaf
    // Required number that determines the leaf's orientation
    rotation: { type: Number, required: true }
}, 
// Enable timestamps for automatic createdAt and updatedAt fields
{ timestamps: true });

// Create and export the Leaf model
// This model will be used to interact with the leaves collection in MongoDB
module.exports = mongoose.model('Leaf', leafSchema); 