// Import Node class
// import Node from './Node.js';

// Branch class represents a connection between two nodes in the tree
// Each branch can have multiple child branches and one parent branch
class Branch {
    // Constructor creates a new branch between two nodes
    constructor(startNode, endNode) {
        this.startNode = startNode;                    // Starting node of the branch
        this.endNode = endNode;                        // Ending node of the branch
        this.thickness = 2;                            // Initial thickness of the branch
        this.children = [];                            // Array of child branches
        this.parent = null;                            // Parent branch reference
        this.isDragging = false;                       // Track if branch is being dragged
        this.dragStartX = 0;                           // Initial X position when dragging
        this.dragStartY = 0;                           // Initial Y position when dragging
        this.id = Math.random().toString(36).substr(2, 9);  // Generate unique ID
        
        // Register this branch with its nodes
        this.startNode.addBranch(this);                // Add branch to start node
        this.endNode.addBranch(this);                  // Add branch to end node
    }

    // Getters for backward compatibility
    // These allow accessing node coordinates through the branch
    get startX() { return this.startNode.x; }          // Get start node X coordinate
    get startY() { return this.startNode.y; }          // Get start node Y coordinate
    get endX() { return this.endNode.x; }              // Get end node X coordinate
    get endY() { return this.endNode.y; }              // Get end node Y coordinate

    // Setters for backward compatibility
    // These allow modifying node coordinates through the branch
    set startX(x) { this.startNode.x = x; }            // Set start node X coordinate
    set startY(y) { this.startNode.y = y; }            // Set start node Y coordinate
    set endX(x) { this.endNode.x = x; }                // Set end node X coordinate
    set endY(y) { this.endNode.y = y; }                // Set end node Y coordinate

    // Draw the branch and its children on the canvas
    draw(ctx) {
        // Draw the branch line
        ctx.beginPath();                               // Start new path
        ctx.moveTo(this.startNode.x, this.startNode.y);  // Move to start node
        ctx.lineTo(this.endNode.x, this.endNode.y);    // Draw line to end node
        ctx.strokeStyle = 'rgb(255, 255, 255)';        // Set line color
        ctx.lineWidth = this.thickness;                // Set line thickness
        ctx.lineCap = 'round';                         // Round line ends
        ctx.stroke();                                  // Draw the line
        
        // Draw intersection point (node) only if this is the first branch at this point
        // or if this is a root branch
        if (!this.parent || this.parent.children[0] === this) {
            ctx.beginPath();                           // Start new path
            ctx.arc(this.startNode.x, this.startNode.y, 3, 0, Math.PI * 2);  // Draw circle
            ctx.fillStyle = this.isDragging ? 'rgba(255, 255, 255, 0.5)' : 'rgb(255, 255, 255)';  // Set color
            ctx.fill();                                // Fill the circle
        }

        // Draw endpoint node only if it has no children
        if (this.children.length === 0) {
            ctx.beginPath();                           // Start new path
            ctx.arc(this.endNode.x, this.endNode.y, 3, 0, Math.PI * 2);  // Draw circle
            ctx.fillStyle = 'rgb(255, 255, 255)';      // Set color
            ctx.fill();                                // Fill the circle
        }
        
        // Draw all child branches
        this.children.forEach(child => child.draw(ctx));
    }

    // Add a child branch to this branch
    addChild(branch) {
        // Share the end node with the child branch's start node
        branch.startNode = this.endNode;               // Set child's start node
        this.endNode.addBranch(branch);                // Register branch with node
        this.children.push(branch);                    // Add to children array
        branch.parent = this;                          // Set parent reference
        this.updateThicknessToRoot();                  // Update branch thickness
    }

    // Remove a child branch
    removeChild(branch) {
        const index = this.children.findIndex(child => child.id === branch.id);  // Find branch index
        if (index !== -1) {                          // If branch exists
            this.children.splice(index, 1);           // Remove from children array
            branch.parent = null;                     // Clear parent reference
            this.updateThicknessToRoot();             // Update branch thickness
        }
    }

    // Update branch thickness based on number of descendants
    updateThicknessToRoot() {
        const totalDescendants = this.countTotalDescendants();  // Count all descendants
        this.thickness = 2 + (totalDescendants * 0.5);         // Calculate new thickness
        if (this.parent) {                                     // If has parent
            this.parent.updateThicknessToRoot();               // Update parent thickness
        }
    }

    // Count total number of descendant branches
    countTotalDescendants() {
        let count = this.children.length;                      // Start with direct children
        for (const child of this.children) {                   // For each child
            count += child.countTotalDescendants();            // Add their descendants
        }
        return count;
    }

    // Start dragging this branch
    startDragging() {
        this.isDragging = true;                               // Set dragging flag
        this.dragStartX = this.startNode.x;                   // Store initial X
        this.dragStartY = this.startNode.y;                   // Store initial Y
    }

    // Stop dragging this branch
    stopDragging() {
        this.isDragging = false;                              // Clear dragging flag
    }

    // Move the intersection point of this branch
    moveIntersection(dx, dy, tree) {
        if (!this.isDragging) return;                         // Exit if not dragging
        const originalX = this.startNode.x;                   // Store original X
        const originalY = this.startNode.y;                   // Store original Y
        const newX = this.dragStartX + dx;                    // Calculate new X
        const newY = this.dragStartY + dy;                    // Calculate new Y
        // Move the node
        this.startNode.x = newX;                             // Update X coordinate
        this.startNode.y = newY;                             // Update Y coordinate
        // Update leaves attached to this node
        tree.leaves.forEach(leaf => {
            if (Math.abs(leaf.x - originalX) < 1 && Math.abs(leaf.y - originalY) < 1) {
                leaf.x = newX;                               // Update leaf X
                leaf.y = newY;                               // Update leaf Y
            }
        });
    }

    // Check if a point is near this branch's nodes
    containsPoint(x, y, tolerance = 5) {
        // Check if point is at start node (intersection)
        if (!this.parent || this.parent.children[0] === this) {
            const distToStart = Math.sqrt(
                Math.pow(x - this.startNode.x, 2) + 
                Math.pow(y - this.startNode.y, 2)
            );
            if (distToStart <= tolerance) return true;
        }
        // Check if point is at end node (only for leaf branches)
        if (this.children.length === 0) {
            const distToEnd = Math.sqrt(
                Math.pow(x - this.endNode.x, 2) + 
                Math.pow(y - this.endNode.y, 2)
            );
            if (distToEnd <= tolerance) return true;
        }
        return false;
    }

    // Check if a point is at a node
    isPointAtNode(x, y, tolerance = 1) {
        return Math.abs(x - this.startNode.x) < tolerance && 
               Math.abs(y - this.startNode.y) < tolerance;
    }

    // Get all branches connected to a node
    getConnectedBranches(tree, x, y) {
        if (!tree) return [];

        return tree.branches.filter(branch => 
            branch !== this && 
            (branch.isPointAtNode(x, y) || this.isPointAtNode(branch.startNode.x, branch.startNode.y))
        );
    }

    // Find all intersections in this branch and its children
    getAllIntersections() {
        let intersections = [{
            branch: this,
            x: this.startNode.x,
            y: this.startNode.y
        }];

        this.children.forEach(child => {
            intersections = intersections.concat(child.getAllIntersections());
        });

        return intersections;
    }

    // Find the closest intersection to a point
    findClosestIntersection(x, y) {
        const intersections = this.getAllIntersections();
        
        // Calculate distances for all intersections
        intersections.forEach(intersection => {
            const dx = x - intersection.x;
            const dy = y - intersection.y;
            intersection.distance = Math.sqrt(dx * dx + dy * dy);
        });

        // Sort by distance and return the closest one
        intersections.sort((a, b) => a.distance - b.distance);
        return intersections[0];
    }

    // Calculate distance between two points
    distanceToPoint(x, y, px, py) {
        const dx = x - px;
        const dy = y - py;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Check if a point is near an intersection
    containsIntersection(x, y, tolerance = 10) {
        const dx = x - this.startNode.x;
        const dy = y - this.startNode.y;
        return Math.sqrt(dx * dx + dy * dy) <= tolerance;
    }

    // Check if a point is near an endpoint
    containsEndpoint(x, y, tolerance = 10) {
        // Only consider endpoints that don't have children
        if (this.children.length > 0) return false;
        
        const dx = x - this.endNode.x;
        const dy = y - this.endNode.y;
        return Math.sqrt(dx * dx + dy * dy) <= tolerance;
    }

    // Find all branches that share this node as their start point
    findSiblingBranches() {
        if (!this.parent) return [];
        
        return this.parent.children.filter(child => 
            child !== this && 
            Math.abs(child.startNode.x - this.startNode.x) < 1 && 
            Math.abs(child.startNode.y - this.startNode.y) < 1
        );
    }

    // Update all sibling branches when this branch moves
    updateSiblings(dx, dy) {
        const siblings = this.findSiblingBranches();
        siblings.forEach(sibling => {
            sibling.startNode.x += dx;
            sibling.startNode.y += dy;
            sibling.moveChildren(dx, dy);
        });
    }
} 