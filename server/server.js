require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const treeRoutes = require('./routes/tree');

const app = express();

// CORS configuration
app.use(cors());

// Basic middleware
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log('Request:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body
    });
    next();
});

// Test route
app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Server is working!' });
});

// API routes
app.use('/api/tree', treeRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Catch-all route for API requests
app.use('/api/*', (req, res) => {
    console.log('API route not found:', req.originalUrl);
    res.status(404).json({ error: 'API endpoint not found' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: err.message });
});

// Connect to MongoDB and start server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/treeNote';
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB at:', MONGODB_URI);
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`API available at:`);
            console.log(`- http://localhost:${PORT}/api/tree`);
            console.log(`- http://127.0.0.1:${PORT}/api/tree`);
            console.log(`Static files served from: ${path.join(__dirname, '..')}`);
            console.log(`Test route: http://localhost:${PORT}/test`);
        });
    })
    .catch(err => {
        console.error('Could not connect to MongoDB:', err);
        console.error('Please make sure MongoDB is running and accessible at:', MONGODB_URI);
        process.exit(1);
    }); 