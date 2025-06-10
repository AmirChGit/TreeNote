// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');

// Define the schema for the Node model
// This schema represents a point in the tree structure
const nodeSchema = new mongoose.Schema({
    // X coordinate of the node
    // Required number that determines the horizontal position
    x: { type: Number, required: true },

    // Y coordinate of the node
    // Required number that determines the vertical position
    y: { type: Number, required: true }
}, { timestamps: true });

// Create and export the Node model
// This model will be used to interact with the nodes collection in MongoDB
module.exports = mongoose.model('Node', nodeSchema); 