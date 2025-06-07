// Load environment variables from .env file
require('dotenv').config();

// Import required Node.js modules and packages
const express = require('express');        // Web framework for Node.js
const mongoose = require('mongoose');      // MongoDB object modeling tool
const cors = require('cors');             // Middleware for enabling CORS
const path = require('path');             // Node.js path module for handling file paths
const treeRoutes = require('./server/routes/tree');  // Import custom routes for tree operations

// Create an Express application instance
const app = express();

// Configure CORS (Cross-Origin Resource Sharing)
// This allows the API to be accessed from different domains
app.use(cors({
    origin: '*',                          // Allow requests from any domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization']      // Allowed headers
}));

// Middleware to parse JSON request bodies
// This allows the server to handle JSON data in requests
app.use(express.json());

// Debug middleware - logs all incoming requests
// This helps in development by showing request details in the console
app.use((req, res, next) => {
    console.log('Request:', {
        method: req.method,               // HTTP method (GET, POST, etc.)
        url: req.url,                     // Request URL
        headers: req.headers,             // Request headers
        body: req.body                    // Request body
    });
    next();                              // Pass control to the next middleware
});

// Test route to verify server is working
// Returns a simple JSON response when accessed
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Mount the tree routes under /api/tree path
// All tree-related API endpoints will be prefixed with /api/tree
app.use('/api/tree', treeRoutes);

// Serve static files from the current directory
// This allows serving HTML, CSS, and client-side JavaScript files
app.use(express.static(__dirname));

// Global error handling middleware
// Catches any errors that occur during request processing
app.use((err, req, res, next) => {
    console.error('Error:', err);         // Log the error
    res.status(500).json({ message: err.message });  // Send error response
});

// Database and server configuration
const MONGODB_URI = process.env.MONGODB_URI;  // MongoDB connection string from environment variables
const PORT = process.env.PORT || 3000;        // Server port (defaults to 3000 if not specified)

// Connect to MongoDB and start the server
mongoose.connect(MONGODB_URI)
    .then(() => {
        // Log successful database connection
        console.log('Connected to MongoDB at:', MONGODB_URI);
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            // Log available API endpoints and test routes
            console.log(`API available at:`);
            console.log(`- http://localhost:${PORT}/api/tree`);
            console.log(`- http://127.0.0.1:${PORT}/api/tree`);
            console.log(`Static files served from: ${__dirname}`);
            console.log(`Test route: http://localhost:${PORT}/test`);
        });
    })
    .catch(err => {
        // Handle database connection errors
        console.error('Could not connect to MongoDB:', err);
        process.exit(1);  // Exit the application if database connection fails
    }); 