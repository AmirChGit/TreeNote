const express = require('express');
const router = express.Router();
const Tree = require('../models/Tree');
const Branch = require('../models/Branch');
const Node = require('../models/Node');
const Leaf = require('../models/Leaf');

console.log('Tree routes loaded');

// Debug middleware for tree routes
router.use((req, res, next) => {
    console.log(`Tree route: ${req.method} ${req.url}`);
    next();
});

// GET /api/tree - Get the entire tree
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/tree - Fetching tree data');
        let tree = await Tree.findOne().populate({
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
            console.log('No tree found, creating new one');
            tree = await Tree.create({
                scale: 1,
                offset: { x: 0, y: 0 },
                nodes: [],
                branches: [],
                leaves: []
            });
        }

        console.log('Tree data retrieved:', JSON.stringify(tree, null, 2));
        res.json(tree);
    } catch (error) {
        console.error('Error in GET /api/tree:', error);
        res.status(500).json({ message: error.message });
    }
});

// POST /api/tree - Create a new tree
router.post('/', async (req, res) => {
    try {
        console.log('POST /api/tree - Creating new tree');
        const tree = await Tree.create({
            scale: req.body.scale || 1,
            offset: req.body.offset || { x: 0, y: 0 },
            nodes: [],
            branches: [],
            leaves: []
        });
        console.log('New tree created:', tree);
        res.status(201).json(tree);
    } catch (error) {
        console.error('Error in POST /api/tree:', error);
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/tree - Update the entire tree
router.put('/', async (req, res) => {
    try {
        console.log('PUT /api/tree - Updating tree');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        let tree = await Tree.findOne();
        
        if (!tree) {
            console.log('No tree found, creating new one');
            tree = await Tree.create({
                scale: req.body.scale || 1,
                offset: req.body.offset || { x: 0, y: 0 },
                nodes: [],
                branches: [],
                leaves: []
            });
        }

        // Update tree properties
        tree.scale = req.body.scale;
        tree.offset = req.body.offset;

        // Clear existing references
        if (tree.nodes && tree.nodes.length > 0) {
            await Node.deleteMany({ _id: { $in: tree.nodes } });
        }
        if (tree.branches && tree.branches.length > 0) {
            await Branch.deleteMany({ _id: { $in: tree.branches } });
        }
        if (tree.leaves && tree.leaves.length > 0) {
            await Leaf.deleteMany({ _id: { $in: tree.leaves } });
        }

        // Create new nodes and store their IDs
        const nodeMap = new Map(); // Map to store frontend ID -> MongoDB ID mapping
        let nodes = [];
        
        if (req.body.nodes && Array.isArray(req.body.nodes)) {
            console.log('Processing nodes:', JSON.stringify(req.body.nodes, null, 2));
            
            // Validate and prepare node data
            const nodeData = req.body.nodes.map(node => {
                console.log('Processing node:', node);
                if (!node || typeof node !== 'object') {
                    throw new Error('Invalid node data: node must be an object');
                }
                if (typeof node.x !== 'number' || typeof node.y !== 'number') {
                    console.error('Invalid node coordinates:', { x: node.x, y: node.y });
                    throw new Error(`Invalid node coordinates: x and y must be numbers, got x=${typeof node.x}, y=${typeof node.y}`);
                }
                return {
                    x: node.x,
                    y: node.y
                };
            });
            
            console.log('Prepared node data:', JSON.stringify(nodeData, null, 2));
            
            try {
                nodes = await Node.insertMany(nodeData);
                console.log('Successfully created nodes:', JSON.stringify(nodes, null, 2));
            } catch (error) {
                console.error('Error creating nodes:', error);
                throw error;
            }
            
            // Create mapping between frontend IDs and MongoDB IDs
            req.body.nodes.forEach((node, index) => {
                if (nodes[index] && nodes[index]._id) {
                    nodeMap.set(node.id, nodes[index]._id);
                }
            });
        }
        
        tree.nodes = nodes.map(node => node._id);

        // Create new branches with proper MongoDB ObjectIds
        const branches = req.body.branches ? await Branch.insertMany(
            req.body.branches.map(branch => ({
                startNode: nodeMap.get(branch.startNode),
                endNode: nodeMap.get(branch.endNode),
                thickness: branch.thickness || 2
            }))
        ) : [];
        tree.branches = branches.map(branch => branch._id);

        // Create new leaves with proper note stringification
        const leaves = req.body.leaves ? await Leaf.insertMany(
            req.body.leaves.map(leaf => ({
                x: leaf.x || 0,
                y: leaf.y || 0,
                note: typeof leaf.note === 'string' ? leaf.note : JSON.stringify(leaf.note),
                branchAngle: leaf.branchAngle || 0,
                leafIndex: leaf.leafIndex || 0,
                totalLeaves: leaf.totalLeaves || 1,
                scale: leaf.scale || 1,
                rotation: leaf.rotation || 0
            }))
        ) : [];
        tree.leaves = leaves.map(leaf => leaf._id);

        await tree.save();
        console.log('Tree updated successfully');
        res.json(tree);
    } catch (error) {
        console.error('Error in PUT /api/tree:', error);
        res.status(400).json({ 
            message: error.message,
            details: error.errors || error.stack
        });
    }
});

module.exports = router; 