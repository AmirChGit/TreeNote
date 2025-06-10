const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/treeNote', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Models
const User = require('./server/models/User');
const Tree = require('./server/models/Tree');
const Node = require('./server/models/Node');
const Branch = require('./server/models/Branch');
const Leaf = require('./server/models/Leaf');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            verificationCode,
            isVerified: false
        });

        await user.save();

        // Send verification email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your TreeNote account',
            html: `
                <h1>Welcome to TreeNote!</h1>
                <p>Your verification code is: <strong>${verificationCode}</strong></p>
                <p>This code will expire in 1 hour.</p>
            `
        });

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

app.post('/api/auth/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        user.isVerified = true;
        user.verificationCode = null;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Verification failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email first' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    // Since we're using JWT, we don't need to do anything server-side
    // The client will remove the token
    res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/verify-token', authenticateToken, async (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email
        }
    });
});

// Tree routes
app.get('/api/tree', authenticateToken, async (req, res) => {
    try {
        console.log('GET /api/tree - Fetching tree data for user:', req.user._id);
        let tree = await Tree.findOne({ user: req.user._id }).populate({
            path: 'nodes',
            model: 'Node'
        }).populate({
            path: 'branches',
            model: 'Branch',
            populate: [
                { path: 'startNode', model: 'Node' },
                { path: 'endNode', model: 'Node' }
            ]
        }).populate({
            path: 'leaves',
            model: 'Leaf'
        });
        
        if (!tree) {
            console.log('No tree found, creating new one for user:', req.user._id);
            tree = new Tree({
                user: req.user._id,
                scale: 1,
                offset: { x: 0, y: 0 },
                nodes: [],
                branches: [],
                leaves: []
            });
            await tree.save();
        }

        console.log('Tree data retrieved successfully');
        res.json(tree);
    } catch (error) {
        console.error('Get tree error:', error);
        res.status(500).json({ message: 'Failed to get tree', error: error.message });
    }
});

app.post('/api/tree', authenticateToken, async (req, res) => {
    try {
        console.log('POST /api/tree - Saving tree data for user:', req.user._id);
        const treeData = req.body;
        
        // Find existing tree or create new one
        let tree = await Tree.findOne({ user: req.user._id });
        
        if (!tree) {
            console.log('Creating new tree for user:', req.user._id);
            tree = new Tree({
                user: req.user._id,
                scale: treeData.scale || 1,
                offset: treeData.offset || { x: 0, y: 0 },
                nodes: [],
                branches: [],
                leaves: []
            });
        } else {
            console.log('Updating existing tree for user:', req.user._id);
            // Update basic properties
            tree.scale = treeData.scale || tree.scale;
            tree.offset = treeData.offset || tree.offset;
        }

        // Handle nodes
        if (treeData.nodes && Array.isArray(treeData.nodes)) {
            // Clear existing nodes
            if (tree.nodes && tree.nodes.length > 0) {
                await Node.deleteMany({ _id: { $in: tree.nodes } });
            }
            
            // Create new nodes
            const nodes = await Node.insertMany(
                treeData.nodes.map(node => ({
                    x: node.x,
                    y: node.y
                }))
            );

            // Create a map of client IDs to MongoDB IDs
            const nodeIdMap = {};
            treeData.nodes.forEach((node, index) => {
                nodeIdMap[node.id] = nodes[index]._id;
            });

            // Handle branches with mapped node IDs
            if (treeData.branches && Array.isArray(treeData.branches)) {
                // Clear existing branches
                if (tree.branches && tree.branches.length > 0) {
                    await Branch.deleteMany({ _id: { $in: tree.branches } });
                }
                
                // Create new branches with mapped node IDs
                const branches = await Branch.insertMany(
                    treeData.branches.map(branch => ({
                        startNode: nodeIdMap[branch.startNode],
                        endNode: nodeIdMap[branch.endNode],
                        thickness: branch.thickness || 2
                    }))
                );
                tree.branches = branches.map(branch => branch._id);
            }

            // Update tree nodes
            tree.nodes = nodes.map(node => node._id);
        }

        // Handle leaves
        if (treeData.leaves && Array.isArray(treeData.leaves)) {
            // Clear existing leaves
            if (tree.leaves && tree.leaves.length > 0) {
                await Leaf.deleteMany({ _id: { $in: tree.leaves } });
            }
            
            // Create new leaves
            const leaves = await Leaf.insertMany(
                treeData.leaves.map(leaf => ({
                    x: leaf.x,
                    y: leaf.y,
                    note: typeof leaf.note === 'string' ? leaf.note : JSON.stringify(leaf.note),
                    branchAngle: leaf.branchAngle || 0,
                    leafIndex: leaf.leafIndex || 0,
                    totalLeaves: leaf.totalLeaves || 1,
                    scale: leaf.scale || 1,
                    rotation: leaf.rotation || 0
                }))
            );
            tree.leaves = leaves.map(leaf => leaf._id);
        }

        await tree.save();
        console.log('Tree saved successfully');
        
        // Return populated tree data
        const populatedTree = await Tree.findById(tree._id).populate({
            path: 'nodes',
            model: 'Node'
        }).populate({
            path: 'branches',
            model: 'Branch',
            populate: [
                { path: 'startNode', model: 'Node' },
                { path: 'endNode', model: 'Node' }
            ]
        }).populate({
            path: 'leaves',
            model: 'Leaf'
        });

        res.json(populatedTree);
    } catch (error) {
        console.error('Save tree error:', error);
        res.status(500).json({ 
            message: 'Failed to save tree',
            error: error.message,
            details: error.stack
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 