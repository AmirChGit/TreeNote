// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');

// Define the schema for the Tree model
// This schema represents the structure of a tree in the application
const treeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scale: {
        type: Number,
        default: 1
    },
    offset: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
    },
    nodes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node'
    }],
    branches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    }],
    leaves: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Leaf'
    }]
}, 
// Enable timestamps for automatic createdAt and updatedAt fields
{ timestamps: true });

// Create and export the Tree model
// This model will be used to interact with the trees collection in MongoDB
module.exports = mongoose.model('Tree', treeSchema); 