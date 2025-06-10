// import Node from './Node.js';

// Tree class for managing and rendering the tree visualization
class Tree {
    // Constructor initializes the tree with a canvas element
    constructor(canvas) {
        this.canvas = canvas;                          // Store the canvas element
        this.ctx = canvas.getContext('2d');           // Get 2D rendering context
        this.branches = [];                           // Array to store branch objects
        this.leaves = [];                             // Array to store leaf objects
        this.nodes = [];                              // Array to store node objects
        this.seed = { radius: 15 };                   // Seed configuration
        this.scale = 1;                               // Current zoom level
        this.offset = { x: canvas.width / 2, y: canvas.height / 2 };  // View offset
        this.isDragging = false;                      // Track if tree is being dragged
        this.lastMousePos = { x: 0, y: 0 };           // Last mouse position for dragging
        
        this.setupCanvas();                           // Initialize canvas
        this.createSeed();                            // Create the seed node
        this.setupEventListeners();                   // Set up user interaction handlers
    }

    // Set up canvas and handle window resizing
    setupCanvas() {
        const updateSize = () => {
            this.canvas.width = window.innerWidth;     // Set canvas width to window width
            this.canvas.height = window.innerHeight;   // Set canvas height to window height
            this.centerView();                         // Center the view
        };

        window.addEventListener('resize', updateSize);  // Handle window resize
        updateSize();                                  // Initial size setup
    }

    // Center the view on the canvas
    centerView() {
        this.offset.x = this.canvas.width / 2;         // Center horizontally
        this.offset.y = this.canvas.height - 100;      // Position near bottom
    }

    // Create the seed node at the base of the tree
    createSeed() {
        this.seed = {
            x: 0,                                      // X position
            y: 0,                                      // Y position
            radius: 5,                                 // Size of the seed
            color: 'rgb(255, 255, 255)'               // Color of the seed
        };
    }

    // Set up event listeners for user interaction
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));    // Handle mouse down
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));    // Handle mouse movement
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));        // Handle mouse up
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));            // Handle zooming
    }

    // Handle mouse down event for dragging
    handleMouseDown(e) {
        const mousePos = this.getMousePosition(e);     // Get mouse position
        this.isDragging = true;                       // Start dragging
        this.lastMousePos = mousePos;                 // Store initial position
    }

    // Handle mouse movement for dragging
    handleMouseMove(e) {
        if (this.isDragging) {
            const mousePos = this.getMousePosition(e); // Get current mouse position
            // Update offset based on mouse movement
            this.offset.x += mousePos.x - this.lastMousePos.x;
            this.offset.y += mousePos.y - this.lastMousePos.y;
            this.lastMousePos = mousePos;             // Update last position
            this.draw();                              // Redraw the tree
        }
    }

    // Handle mouse up event to stop dragging
    handleMouseUp() {
        this.isDragging = false;                      // Stop dragging
    }

    // Handle mouse wheel for zooming
    handleWheel(e) {
        e.preventDefault();                           // Prevent default scrolling
        const delta = e.deltaY > 0 ? 0.9 : 1.1;       // Determine zoom direction
        this.scale *= delta;                          // Update scale
        // Clamp scale between 0.1 and 5
        this.scale = Math.max(0.1, Math.min(5, this.scale));
        this.draw();                                  // Redraw the tree
    }

    // Convert mouse coordinates to canvas coordinates
    getMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / this.scale,   // Scale X coordinate
            y: (e.clientY - rect.top) / this.scale     // Scale Y coordinate
        };
    }

    // Draw the seed node
    drawSeed() {
        this.ctx.save();                              // Save current context state
        this.ctx.beginPath();                         // Start new path
        this.ctx.arc(0, 0, this.seed.radius, 0, Math.PI * 2);  // Draw circle
        this.ctx.fillStyle = this.seed.color || 'rgb(255,255,255)';  // Set color
        this.ctx.shadowBlur = 10;                     // Add glow effect
        this.ctx.shadowColor = 'rgba(255,255,255,0.8)';  // Set glow color
        this.ctx.fill();                              // Fill the circle
        this.ctx.shadowBlur = 0;                      // Reset shadow
        this.ctx.restore();                           // Restore context state
    }

    // Main drawing function
    draw() {
        this.ctx.save();                              // Save current context state
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);  // Clear canvas
        this.ctx.translate(this.offset.x, this.offset.y);  // Apply offset
        this.ctx.scale(this.scale, this.scale);       // Apply zoom
        this.drawSeed();                              // Draw seed
        this.branches.forEach(branch => branch.draw(this.ctx));  // Draw branches
        this.leaves.forEach(leaf => leaf.draw(this.ctx));  // Draw leaves
        this.ctx.restore();                           // Restore context state
    }

    // Find a node at specific coordinates within tolerance
    findNode(x, y, tolerance = 1) {
        return this.nodes.find(node => 
            Math.abs(node.x - x) < tolerance &&       // Check X coordinate
            Math.abs(node.y - y) < tolerance          // Check Y coordinate
        ) || null;
    }

    // Get existing node or create new one at coordinates
    getOrCreateNode(x, y, tolerance = 1) {
        let node = this.findNode(x, y, tolerance);    // Try to find existing node
        if (!node) {
            node = new Node(x, y);                    // Create new node if none exists
            this.nodes.push(node);                    // Add to nodes array
        }
        return node;
    }

    // Add a branch using coordinate pairs
    addBranch(startX, startY, endX, endY) {
        const startNode = this.getOrCreateNode(startX, startY);  // Get/create start node
        const endNode = this.getOrCreateNode(endX, endY);        // Get/create end node
        const branch = new Branch(startNode, endNode);           // Create branch
        this.branches.push(branch);                             // Add to branches array
        return branch;
    }

    // Add a branch using existing nodes
    addBranchWithNodes(startNode, endNode) {
        const branch = new Branch(startNode, endNode);  // Create branch
        this.branches.push(branch);                    // Add to branches array
        return branch;
    }

    // Add a leaf with a note at specific coordinates
    addLeaf(x, y, note) {
        const leaf = new Leaf(x, y, note);            // Create leaf
        this.leaves.push(leaf);                       // Add to leaves array
        this.draw();                                  // Redraw the tree
    }
} 