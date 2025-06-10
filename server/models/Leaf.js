// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');

// Define the schema for the Leaf model
// This schema represents a note or content attached to the tree structure
const leafSchema = new mongoose.Schema({
    // X coordinate of the leaf
    // Required number that determines the horizontal position
    x: {
        type: Number,
        required: true
    },

    // Y coordinate of the leaf
    // Required number that determines the vertical position
    y: {
        type: Number,
        required: true
    },

    // Content of the note
    // Required string that contains the actual note text
    note: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },

    // Angle of the leaf relative to its branch
    // Required number that determines the orientation
    branchAngle: {
        type: Number,
        default: 0
    },

    // Index of this leaf among all leaves on the same branch
    // Required number for ordering leaves
    leafIndex: {
        type: Number,
        default: 0
    },

    // Total number of leaves on the same branch
    // Required number for calculating leaf spacing
    totalLeaves: {
        type: Number,
        default: 1
    },

    // Scale factor for the leaf
    // Required number that determines the size of the leaf
    scale: {
        type: Number,
        default: 1
    },

    // Rotation angle of the leaf
    // Required number that determines the leaf's orientation
    rotation: {
        type: Number,
        default: 0
    }
}, 
// Enable timestamps for automatic createdAt and updatedAt fields
{ timestamps: true });

// Create and export the Leaf model
// This model will be used to interact with the leaves collection in MongoDB
module.exports = mongoose.model('Leaf', leafSchema); 