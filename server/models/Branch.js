// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');

// Define the schema for the Branch model
// This schema represents a connection between nodes in the tree structure
const branchSchema = new mongoose.Schema({
    // Reference to the starting node of the branch
    // Required reference to a Node document
    startNode: { type: mongoose.Schema.Types.ObjectId, ref: 'Node', required: true },

    // Reference to the ending node of the branch
    // Required reference to a Node document
    endNode: { type: mongoose.Schema.Types.ObjectId, ref: 'Node', required: true },

    // Thickness of the branch
    // Required number that determines the visual width of the branch
    thickness: { type: Number, default: 2 },

    // Array of references to child branches
    // These are branches that extend from this branch
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],

    // Reference to the parent branch
    // This is the branch that this branch extends from
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }
}, 
// Enable timestamps for automatic createdAt and updatedAt fields
{ timestamps: true });

// Create and export the Branch model
// This model will be used to interact with the branches collection in MongoDB
module.exports = mongoose.model('Branch', branchSchema); 