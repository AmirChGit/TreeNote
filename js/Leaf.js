// Leaf class represents a note or content attached to the tree
// Each leaf has a position, rotation, and visual properties
class Leaf {
    // Constructor creates a new leaf with specified properties
    constructor(x, y, note, branchAngle = 0, leafIndex = 0, totalLeaves = 1) {
        this.x = x;                                    // X coordinate of the leaf
        this.y = y;                                    // Y coordinate of the leaf
        this.note = note;                              // Content of the note
        this.scale = 1;                                // Scale factor for the leaf
        
        // Calculate initial rotation based on branch angle
        // First leaf aligns with branch direction, others spread from it
        let rotation = branchAngle - Math.PI/2;        // Rotate 90° to align with branch
        
        if (leafIndex > 0) {
            // For side leaves, alternate left and right
            const side = leafIndex % 2 === 1 ? 1 : -1;  // Alternate direction
            const distance = Math.ceil(leafIndex / 2);  // Distance from center
            // Spread angle gets wider for further leaves (21° for first pair, 42° for second pair)
            const baseSpreadUnit = (21 * Math.PI / 180);  // Base spread of 21 degrees
            const spreadAngle = baseSpreadUnit * side * distance;  // Calculate spread
            rotation += spreadAngle;                    // Apply spread to rotation
        }
        
        // Add random variation to rotation
        const variation = (Math.random() - 0.5) * Math.PI / 24;  // ±7.5 degrees variation
        this.rotation = rotation + variation;           // Apply variation
        
        // Generate a slight base color variation (for RGB components)
        const colorVar = Math.floor(Math.random() * 15 - 7.5);  // ±7.5 brightness variation
        this.baseRed = 255 + colorVar;                 // Red component
        this.baseGreen = 255 + colorVar;               // Green component
        this.baseBlue = 255 + colorVar;                // Blue component
        
        this.shape = this.generateLeafShape();         // Generate leaf shape
        this.isDragging = false;                       // Track if leaf is being dragged
        this.originalX = x;                            // Store original X position
        this.originalY = y;                            // Store original Y position
        this.originalRotation = this.rotation;         // Store original rotation
    }

    // Generate the shape points for the leaf
    generateLeafShape() {
        const length = 32;                             // Total length of leaf
        const width = 14;                              // Maximum width at the widest point
        const variation = 0.95 + Math.random() * 0.1;  // Slight size variation (0.95-1.05)
        
        // Create a more polygonal leaf shape with harder edges
        return [
            { x: 0, y: 0 },                            // Base point (sharp)
            { x: width * 0.4 * variation, y: length * 0.2 },  // First corner right
            { x: width * variation, y: length * 0.4 }, // Maximum width point right
            { x: width * 0.6 * variation, y: length * 0.7 },  // Mid-taper point right
            { x: width * 0.2 * variation, y: length * 0.9 },  // Pre-tip point right
            { x: 0, y: length * variation },           // Tip point (sharp)
            { x: -width * 0.2 * variation, y: length * 0.9 }, // Pre-tip point left
            { x: -width * 0.6 * variation, y: length * 0.7 }, // Mid-taper point left
            { x: -width * variation, y: length * 0.4 }, // Maximum width point left
            { x: -width * 0.4 * variation, y: length * 0.2 }  // First corner left
        ];
    }

    // Draw the leaf on the canvas
    draw(ctx) {
        ctx.save();                                    // Save current context state
        ctx.translate(this.x, this.y);                 // Move to leaf position
        ctx.rotate(this.rotation);                     // Apply rotation
        ctx.scale(this.scale, this.scale);             // Apply scale

        // Draw filled lozenge/diamond shape using polygon points
        ctx.beginPath();                               // Start new path
        ctx.moveTo(this.shape[0].x, this.shape[0].y);  // Move to first point
        for (let i = 1; i < this.shape.length; i++) {  // Draw lines to each point
            ctx.lineTo(this.shape[i].x, this.shape[i].y);
        }
        ctx.closePath();                               // Close the path
        ctx.fillStyle = `rgb(${this.baseRed}, ${this.baseGreen}, ${this.baseBlue})`;  // Set color
        ctx.globalAlpha = 0.85;                        // Set transparency
        ctx.shadowColor = 'rgba(0,0,0,0.2)';           // Set shadow color
        ctx.shadowBlur = 6;                            // Set shadow blur
        ctx.fill();                                    // Fill the shape
        ctx.globalAlpha = 1.0;                         // Reset transparency
        ctx.restore();                                 // Restore context state
    }

    // Start dragging this leaf
    startDragging() {
        this.isDragging = true;                        // Set dragging flag
        this.originalX = this.x;                       // Store original X
        this.originalY = this.y;                       // Store original Y
        this.originalRotation = this.rotation;         // Store original rotation
    }

    // Stop dragging this leaf
    stopDragging() {
        this.isDragging = false;                       // Clear dragging flag
    }

    // Move the leaf by the specified delta
    move(dx, dy) {
        if (this.isDragging) {                         // Only move if dragging
            this.x += dx;                              // Update X position
            this.y += dy;                              // Update Y position
        }
    }

    // Set the scale of the leaf
    setScale(scale) {
        this.scale = Math.max(0.5, Math.min(2, scale));  // Clamp scale between 0.5 and 2
    }

    // Check if a point is within the leaf's area
    containsPoint(x, y) {
        // Transform point to leaf's coordinate space
        const dx = x - this.x;
        const dy = y - this.y;
        
        // Rotate point back to align with leaf's orientation
        const rotatedX = dx * Math.cos(-this.rotation) - dy * Math.sin(-this.rotation);
        const rotatedY = dx * Math.sin(-this.rotation) + dy * Math.cos(-this.rotation);
        
        // Scale point to account for leaf's scale
        const scaledX = rotatedX / this.scale;
        const scaledY = rotatedY / this.scale;
        
        // Check if point is inside the leaf shape using ray casting algorithm
        let inside = false;
        for (let i = 0, j = this.shape.length - 1; i < this.shape.length; j = i++) {
            const xi = this.shape[i].x, yi = this.shape[i].y;
            const xj = this.shape[j].x, yj = this.shape[j].y;
            
            // Add a small tolerance to make clicking easier
            const tolerance = 2;
            const intersect = ((yi > scaledY - tolerance) !== (yj > scaledY - tolerance))
                && (scaledX < (xj - xi) * (scaledY - yi) / (yj - yi) + xi + tolerance);
            if (intersect) inside = !inside;
        }
        
        return inside;
    }
} 