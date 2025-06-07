// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');

// Define the schema for the Tree model
// This schema represents the structure of a tree in the application
const treeSchema = new mongoose.Schema({
    // Scale factor for the entire tree
    // Required number that determines the overall size of the tree
    scale: { type: Number, required: true },

    // Offset position of the tree
    // Required object containing x and y coordinates
    offset: {
        x: { type: Number, required: true },  // X coordinate of the tree's position
        y: { type: Number, required: true }   // Y coordinate of the tree's position
    },

    // Array of references to Node documents
    // Each node represents a point in the tree structure
    nodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Node' }],

    // Array of references to Branch documents
    // Each branch represents a connection between nodes
    branches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],

    // Array of references to Leaf documents
    // Each leaf represents a note or content attached to the tree
    leaves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Leaf' }]
}, 
// Enable timestamps for automatic createdAt and updatedAt fields
{ timestamps: true });

// Create and export the Tree model
// This model will be used to interact with the trees collection in MongoDB
module.exports = mongoose.model('Tree', treeSchema); 