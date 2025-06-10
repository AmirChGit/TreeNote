// Node class represents a point in the tree structure
// Each node can be connected to multiple branches
class Node {
    // Constructor creates a new node at specified coordinates
    constructor(x, y) {
        this.x = x;                                    // X coordinate of the node
        this.y = y;                                    // Y coordinate of the node
        this.id = Math.random().toString(36).substr(2, 9);  // Generate unique ID
        this.branches = [];                            // Array to store connected branches
    }

    // Add a branch to this node if it's not already connected
    addBranch(branch) {
        if (!this.branches.includes(branch)) {         // Check if branch already exists
            this.branches.push(branch);                // Add branch to array
        }
    }

    // Remove a branch from this node
    removeBranch(branch) {
        const idx = this.branches.indexOf(branch);     // Find branch index
        if (idx !== -1) {                             // If branch exists
            this.branches.splice(idx, 1);             // Remove it from array
        }
    }
}

// Export for use in other files (if using modules)
// module.exports = Node; 