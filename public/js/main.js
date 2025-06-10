class TreeNote {
    constructor() {
        this.canvas = document.getElementById('treeCanvas');
        this.tree = new Tree(this.canvas);
        this.activePanel = null;
        this.lastMousePos = { x: 0, y: 0 };
        this.previewBranch = null;
        this.selectedBranch = null;
        this.isCreatingBranch = false;
        this.moveIcon = null;
        this.activeDragTarget = null;
        this.isDraggingNode = false;
        this.api = new API();
        this.user = null;
        this.authToken = localStorage.getItem('authToken');
        
        // Get auth panel elements
        this.authPanel = document.getElementById('authPanel');
        this.loginPanel = document.getElementById('loginPanel');
        this.registerPanel = document.getElementById('registerPanel');
        this.verificationPanel = document.getElementById('verificationPanel');
        this.seed = document.getElementById('seed');
        
        this.setupEventListeners();
        this.checkAuth();
        this.animate();

        // Add Escape key handler for branch creation cancel
        document.addEventListener('keydown', (e) => {
            if (this.isCreatingBranch && e.key === 'Escape') {
                this.isCreatingBranch = false;
                this.previewBranch = null;
                this.draw();
            }
        });
    }

    async checkAuth() {
        if (this.authToken) {
            try {
                const user = await this.api.verifyToken();
                this.user = user;
                await this.loadData();
                this.showUserControls();
            } catch (error) {
                console.error('Auth error:', error);
                localStorage.removeItem('authToken');
                this.authToken = null;
                this.showAuthPanel();
            }
        } else {
            this.showAuthPanel();
        }
    }

    showAuthPanel() {
        this.authPanel.style.display = 'flex';
        this.loginPanel.style.display = 'flex';
        this.registerPanel.style.display = 'none';
        this.verificationPanel.style.display = 'none';
        this.seed.style.display = 'none';
    }

    setupEventListeners() {
        // Canvas event listeners
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('mousedown', this.handleGlobalClick.bind(this));

        // Auth form event listeners
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            try {
                const response = await this.api.login(data);
                this.authToken = response.token;
                localStorage.setItem('authToken', response.token);
                this.user = response.user;
                this.authPanel.style.display = 'none';
                this.loadData();
                this.showUserControls();
            } catch (error) {
                alert(error.message || 'Login failed');
            }
        });

        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password')
            };

            try {
                await this.api.register(data);
                alert('Registration successful! Please check your email for verification code.');
                this.showVerificationPanel(data.email);
            } catch (error) {
                alert(error.message || 'Registration failed');
            }
        });

        document.getElementById('verificationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const code = formData.get('code');

            try {
                await this.api.verifyEmail(this.verificationEmail, code);
                alert('Email verified successfully! Please login.');
                this.showAuthPanel();
            } catch (error) {
                alert(error.message || 'Verification failed');
            }
        });

        // Auth panel navigation
        document.getElementById('showRegisterBtn').addEventListener('click', () => {
            this.loginPanel.style.display = 'none';
            this.registerPanel.style.display = 'flex';
        });

        document.getElementById('showLoginBtn').addEventListener('click', () => {
            this.registerPanel.style.display = 'none';
            this.loginPanel.style.display = 'flex';
        });
    }

    showVerificationPanel(email) {
        this.verificationEmail = email;
        this.loginPanel.style.display = 'none';
        this.registerPanel.style.display = 'none';
        this.verificationPanel.style.display = 'flex';
    }

    showUserControls() {
        const bottomBar = document.createElement('div');
        bottomBar.style.position = 'fixed';
        bottomBar.style.bottom = '0';
        bottomBar.style.left = '0';
        bottomBar.style.right = '0';
        bottomBar.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        bottomBar.style.padding = '10px';
        bottomBar.style.display = 'flex';
        bottomBar.style.justifyContent = 'flex-end';
        bottomBar.style.opacity = '0';
        bottomBar.style.transition = 'opacity 0.3s ease';
        bottomBar.style.zIndex = '1000';

        const logoutButton = document.createElement('button');
        logoutButton.textContent = 'Logout';
        logoutButton.style.padding = '8px 15px';
        logoutButton.style.backgroundColor = 'transparent';
        logoutButton.style.color = 'white';
        logoutButton.style.border = '1px solid white';
        logoutButton.style.borderRadius = '5px';
        logoutButton.style.cursor = 'pointer';
        logoutButton.style.fontSize = '14px';
        logoutButton.style.marginRight = '20px';

        logoutButton.addEventListener('click', async () => {
            try {
                await this.api.logout(this.authToken);
                localStorage.removeItem('authToken');
                this.authToken = null;
                this.user = null;
                bottomBar.remove();
                this.showAuthPanel();
            } catch (error) {
                alert(error.message || 'Logout failed');
            }
        });

        bottomBar.appendChild(logoutButton);
        document.body.appendChild(bottomBar);

        // Show/hide on hover
        document.addEventListener('mousemove', (e) => {
            if (e.clientY > window.innerHeight - 50) {
                bottomBar.style.opacity = '1';
            } else {
                bottomBar.style.opacity = '0';
            }
        });
    }

    clearData() {
        localStorage.removeItem('treeNoteData');
        this.tree.branches = [];
        this.tree.leaves = [];
    }

    handleGlobalClick(e) {
        // Close note panel if clicking outside
        if (this.activePanel && !this.activePanel.contains(e.target)) {
            this.activePanel.remove();
            this.activePanel = null;
        }
    }

    handleClick(e) {
        console.log('handleClick called');
        const mousePos = this.getMousePosition(e);
        
        // Check if clicking on seed
        if (this.tree.branches.length === 0 && this.isClickOnSeed(mousePos)) {
            console.log('Seed clicked, creating trunk');
            // Create the first trunk (branch) from (0,0) to (0,-100)
            this.tree.addBranch(0, 0, 0, -100);
            this.isCreatingBranch = false;
            this.previewBranch = null;
            this.draw();
            this.saveData && this.saveData();
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        // Check if clicking on any branch point (intersection or endpoint)
        for (const branch of this.tree.branches) {
            // Check intersection point
            if (branch.containsIntersection(mousePos.x, mousePos.y)) {
                this.showBranchOptions(branch, true);
                return;
            }
            // Check endpoint
            if (branch.containsEndpoint(mousePos.x, mousePos.y)) {
                this.showBranchOptions(branch, false);
                return;
            }
        }

        // Check if clicking outside any interactive element
        if (this.activePanel) {
            this.activePanel.remove();
            this.activePanel = null;
        }
    }

    handleDoubleClick(e) {
        const mousePos = this.getMousePosition(e);
        
        // Check if double-clicking on leaf
        const leaf = this.findLeaf(mousePos);
        if (leaf) {
            this.showLeafNote(leaf);
        }
    }

    getMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: ((e.clientX - rect.left) * scaleX - this.tree.offset.x) / this.tree.scale,
            y: ((e.clientY - rect.top) * scaleY - this.tree.offset.y) / this.tree.scale
        };
    }

    isClickOnSeed(mousePos) {
        // The seed is always at (0,0) in tree coordinates
        const dx = mousePos.x;
        const dy = mousePos.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.tree.seed.radius;
    }

    createInitialBranch() {
        // Only create initial branch if there are no branches yet
        if (this.tree.branches.length === 0) {
            const startX = 0;
            const startY = 0;
            const endX = 0;
            const endY = -100; // Initial branch length upward
            
            this.tree.addBranch(startX, startY, endX, endY);
            this.saveData && this.saveData();
        }
    }

    findBranchEndpoint(mousePos) {
        return this.tree.branches.find(branch => {
            const dx = mousePos.x - branch.endX;
            const dy = mousePos.y - branch.endY;
            return Math.sqrt(dx * dx + dy * dy) <= 10;
        });
    }

    showBranchOptions(branch, isIntersection) {
        if (this.activePanel) {
            this.activePanel.remove();
        }

        const panel = document.createElement('div');
        const rect = this.canvas.getBoundingClientRect();
        
        // Get screen coordinates based on whether we're at intersection or endpoint
        const x = isIntersection ? branch.startX : branch.endX;
        const y = isIntersection ? branch.startY : branch.endY;
        const screenX = (x * this.tree.scale + this.tree.offset.x);
        const screenY = (y * this.tree.scale + this.tree.offset.y);

        panel.style.position = 'fixed';
        panel.style.left = `${rect.left + screenX + 20}px`;
        panel.style.top = `${rect.top + screenY}px`;
        panel.style.zIndex = '1000';
        panel.style.display = 'flex';
        panel.style.gap = '5px';
        panel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        panel.style.padding = '5px';
        panel.style.borderRadius = '20px';
        panel.style.border = '1px solid rgba(255, 255, 255, 0.3)';

        const buttons = [
            { icon: '🌿', action: () => this.startNewBranch(branch, isIntersection), tooltip: 'Add Branch' }
        ];
        // Only show leaf button if endpoint and no children
        if (!isIntersection && branch.children.length === 0) {
            buttons.push({ icon: '🍃', action: () => this.createLeaf(branch), tooltip: 'Add Leaf' });
        }
        // Add move button
        buttons.push({ icon: '✥', action: null, tooltip: 'Move Node', isMove: true });
        // Add delete button
        buttons.push({ icon: '🗑️', action: () => this.deleteBranch(branch), tooltip: 'Delete Branch' });

        buttons.forEach(({ icon, action, tooltip, isMove }) => {
            const button = document.createElement('button');
            button.innerHTML = icon;
            button.title = tooltip;
            this.styleButton(button);
            if (isMove) {
                let isDragging = false;
                let lastMouse = null;
                let originalX = isIntersection ? branch.startX : branch.endX;
                let originalY = isIntersection ? branch.startY : branch.endY;
                let moveButton = button;
                let panelOffsetX = 0;
                let panelOffsetY = 0;
                
                const stopDragging = (e) => {
                    if (isDragging) {
                        e.stopPropagation();
                        e.preventDefault();
                        isDragging = false;
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                        this.saveData();
                    }
                };

                const onMouseMove = (e) => {
                    if (!isDragging) return;
                    e.stopPropagation();
                    e.preventDefault();
                    
                    const mousePos = this.getMousePosition(e);
                    const dx = mousePos.x - lastMouse.x;
                    const dy = mousePos.y - lastMouse.y;
                    
                    // Update the node position
                    if (isIntersection) {
                        branch.startX += dx;
                        branch.startY += dy;
                        // Update parent connection
                        if (branch.parent) {
                            branch.parent.endX = branch.startX;
                            branch.parent.endY = branch.startY;
                        }
                    } else {
                        branch.endX += dx;
                        branch.endY += dy;
                    }
                    
                    // Update leaves attached to this specific node
                    this.tree.leaves.forEach(leaf => {
                        if (Math.abs(leaf.x - originalX) < 1 && Math.abs(leaf.y - originalY) < 1) {
                            leaf.x += dx;
                            leaf.y += dy;
                        }
                    });
                    
                    // Update original position
                    originalX += dx;
                    originalY += dy;
                    
                    // Update panel position to follow cursor
                    panel.style.left = `${e.clientX - panelOffsetX}px`;
                    panel.style.top = `${e.clientY - panelOffsetY}px`;
                    
                    lastMouse = mousePos;
                    this.draw();
                };
                
                const onMouseUp = (e) => {
                    stopDragging(e);
                };
                
                button.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    isDragging = true;
                    lastMouse = this.getMousePosition(e);
                    
                    // Calculate offset from mouse to panel
                    const panelRect = panel.getBoundingClientRect();
                    panelOffsetX = e.clientX - panelRect.left;
                    panelOffsetY = e.clientY - panelRect.top;
                    
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });
            } else if (action) {
                button.addEventListener('click', action);
            }
            panel.appendChild(button);
        });

        document.body.appendChild(panel);
        this.activePanel = panel;
    }

    styleButton(button) {
        Object.assign(button.style, {
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            border: '1px solid rgb(255, 255, 255)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'rgb(255, 255, 255)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            padding: '0',
            margin: '0',
            transition: 'all 0.2s ease'
        });

        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        });
    }

    startNodeDragging(branch) {
        branch.startDragging();
        this.lastMousePos = this.getMousePosition(event);
        
        const onMouseMove = (e) => {
            const currentPos = this.getMousePosition(e);
            const dx = currentPos.x - this.lastMousePos.x;
            const dy = currentPos.y - this.lastMousePos.y;
            
            branch.moveIntersection(dx, dy);
            this.lastMousePos = currentPos;
            this.draw();
        };

        const onMouseUp = () => {
            branch.stopDragging();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            this.saveData();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    startNewBranch(parentBranch, fromIntersection) {
        this.isCreatingBranch = true;
        
        const onMouseMove = (e) => {
            if (!this.isCreatingBranch) return;
            
            const mousePos = this.getMousePosition(e);
            const startX = fromIntersection ? parentBranch.startX : parentBranch.endX;
            const startY = fromIntersection ? parentBranch.startY : parentBranch.endY;
            
            this.previewBranch = {
                startX: startX,
                startY: startY,
                endX: mousePos.x,
                endY: mousePos.y
            };
            this.draw();
        };

        const onMouseUp = (e) => {
            if (!this.isCreatingBranch) return;
            
            const mousePos = this.getMousePosition(e);
            const startX = fromIntersection ? parentBranch.startX : parentBranch.endX;
            const startY = fromIntersection ? parentBranch.startY : parentBranch.endY;
            
            // Check if we're not creating a branch to the same point
            if (Math.abs(mousePos.x - startX) < 1 && Math.abs(mousePos.y - startY) < 1) {
                this.isCreatingBranch = false;
                this.previewBranch = null;
                this.draw();
                return;
            }
            
            // Get or create nodes for the new branch
            const startNode = this.tree.getOrCreateNode(startX, startY);
            const endNode = this.tree.getOrCreateNode(mousePos.x, mousePos.y);
            
            // Create the new branch using the nodes
            const newBranch = this.tree.addBranchWithNodes(startNode, endNode);

            // If creating from an intersection, add the new branch as a sibling
            if (fromIntersection && parentBranch.parent) {
                // Add as a sibling by using the same parent
                parentBranch.parent.addChild(newBranch);
            } else {
                // If creating from an endpoint or the root, add as a child
                parentBranch.addChild(newBranch);
            }
            
            this.isCreatingBranch = false;
            this.previewBranch = null;
            this.saveData();
            this.draw();
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        // Remove any existing event listeners
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        
        // Add new event listeners
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    draw() {
        // Clear the canvas
        this.tree.draw();
        
        // Draw branch preview if active
        if (this.isCreatingBranch && this.previewBranch) {
            const ctx = this.tree.ctx;
            ctx.save();
            ctx.translate(this.tree.offset.x, this.tree.offset.y);
            ctx.scale(this.tree.scale, this.tree.scale);
            
            ctx.beginPath();
            ctx.moveTo(this.previewBranch.startX, this.previewBranch.startY);
            ctx.lineTo(this.previewBranch.endX, this.previewBranch.endY);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // 50% opacity for preview
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.stroke();
            
            ctx.restore();
        }
    }

    createLeaf(branch) {
        if (this.activePanel) {
            this.activePanel.remove();
        }

        // Prevent leaf creation if this branch's endpoint has children
        if (branch.children && branch.children.length > 0) {
            alert('Cannot create a leaf on a node that already has a child branch.');
            return;
        }

        // Count existing leaves for this branch
        const existingLeaves = this.tree.leaves.filter(leaf => 
            Math.abs(leaf.x - branch.endX) < 1 && Math.abs(leaf.y - branch.endY) < 1
        );

        if (existingLeaves.length >= 5) {
            console.log('Maximum number of leaves (5) reached for this branch');
            return;
        }

        const screenX = (branch.endX * this.tree.scale) + this.tree.offset.x;
        const screenY = (branch.endY * this.tree.scale) + this.tree.offset.y;

        Note.createNotePanel(screenX, screenY, 
            (note) => {
                // Calculate branch angle
                const dx = branch.endX - branch.startX;
                const dy = branch.endY - branch.startY;
                const branchAngle = Math.atan2(dy, dx);
                
                // Create leaf with position info
                // Index 0: center
                // Index 1,3: right side (closer, further)
                // Index 2,4: left side (closer, further)
                const leafIndex = existingLeaves.length;
                const leaf = new Leaf(
                    branch.endX,
                    branch.endY,
                    note,
                    branchAngle,
                    leafIndex,
                    5  // Always plan for 5 total leaves
                );
                
                this.tree.leaves.push(leaf);
                this.saveData();
                this.tree.draw();
            },
            () => {
                // Cancel callback
            }
        );
    }

    findLeaf(mousePos) {
        return this.tree.leaves.find(leaf => leaf.containsPoint(mousePos.x, mousePos.y));
    }

    showLeafNote(leaf) {
        if (this.activePanel) {
            this.activePanel.remove();
        }

        const panel = document.createElement('div');
        const rect = this.canvas.getBoundingClientRect();
        const screenX = (leaf.x * this.tree.scale + this.tree.offset.x);
        const screenY = (leaf.y * this.tree.scale + this.tree.offset.y);

        panel.style.position = 'fixed';
        panel.style.left = `${rect.left + screenX + 20}px`;
        panel.style.top = `${rect.top + screenY}px`;
        panel.style.zIndex = '1000';
        panel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        panel.style.padding = '15px';
        panel.style.borderRadius = '10px';
        panel.style.minWidth = '250px';
        panel.style.maxWidth = '400px';
        panel.style.color = 'white';
        panel.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        panel.style.border = '1px solid rgba(255, 255, 255, 0.3)';

        // Create note display container
        const noteDisplay = document.createElement('div');
        noteDisplay.style.width = '100%';
        noteDisplay.style.minHeight = '100px';
        noteDisplay.style.marginBottom = '10px';
        noteDisplay.style.fontFamily = 'Arial, sans-serif';
        noteDisplay.style.fontSize = '14px';
        noteDisplay.style.whiteSpace = 'pre-wrap';
        noteDisplay.style.wordWrap = 'break-word';

        // Format note content
        let noteObj = {};
        if (typeof leaf.note === 'object') {
            try {
                noteObj = typeof leaf.note === 'string' ? JSON.parse(leaf.note) : leaf.note;
                const title = noteObj.title || '';
                const description = noteObj.description || '';
                const createdAt = noteObj.createdAt ? new Date(noteObj.createdAt).toLocaleString() : '';
                const updatedAt = noteObj.updatedAt ? new Date(noteObj.updatedAt).toLocaleString() : '';

                // Create title element
                const titleElement = document.createElement('div');
                titleElement.style.fontWeight = 'bold';
                titleElement.style.fontSize = '16px';
                titleElement.style.marginBottom = '10px';
                titleElement.textContent = title;
                noteDisplay.appendChild(titleElement);

                // Create description element
                const descElement = document.createElement('div');
                descElement.style.marginBottom = '15px';
                descElement.textContent = description;
                noteDisplay.appendChild(descElement);

                // Create metadata element
                const metaElement = document.createElement('div');
                metaElement.style.fontSize = '11px';
                metaElement.style.color = 'rgba(255, 255, 255, 0.7)';
                metaElement.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
                metaElement.style.paddingTop = '10px';
                metaElement.innerHTML = `Created: ${createdAt}<br>Last updated: ${updatedAt}`;
                noteDisplay.appendChild(metaElement);
            } catch (e) {
                noteDisplay.textContent = leaf.note || '';
            }
        } else {
            noteDisplay.textContent = leaf.note || '';
        }

        // Create edit container (initially hidden)
        const editContainer = document.createElement('div');
        editContainer.style.display = 'none';

        // Create title input
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.placeholder = 'Title';
        titleInput.value = noteObj.title || '';
        titleInput.style.width = '100%';
        titleInput.style.marginBottom = '10px';
        titleInput.style.padding = '5px';
        titleInput.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        titleInput.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        titleInput.style.borderRadius = '5px';
        titleInput.style.fontFamily = 'Arial, sans-serif';
        titleInput.style.fontSize = '16px';
        titleInput.style.fontWeight = 'bold';
        titleInput.style.color = 'white';
        titleInput.style.boxSizing = 'border-box';

        // Create description textarea
        const descTextarea = document.createElement('textarea');
        descTextarea.placeholder = 'Description';
        descTextarea.value = noteObj.description || '';
        descTextarea.style.width = '100%';
        descTextarea.style.height = '100px';
        descTextarea.style.marginBottom = '10px';
        descTextarea.style.padding = '5px';
        descTextarea.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        descTextarea.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        descTextarea.style.borderRadius = '5px';
        descTextarea.style.fontFamily = 'Arial, sans-serif';
        descTextarea.style.fontSize = '14px';
        descTextarea.style.resize = 'vertical';
        descTextarea.style.color = 'white';
        descTextarea.style.boxSizing = 'border-box';

        editContainer.appendChild(titleInput);
        editContainer.appendChild(descTextarea);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '5px';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.marginTop = '10px';

        // Edit button
        const editButton = document.createElement('button');
        editButton.textContent = '✎';
        editButton.title = 'Edit';
        this.styleButton(editButton);
        editButton.addEventListener('click', () => {
            noteDisplay.style.display = 'none';
            editContainer.style.display = 'block';
            titleInput.focus();
            editButton.style.display = 'none';
            saveButton.style.display = 'block';
        });

        // Save button (initially hidden)
        const saveButton = document.createElement('button');
        saveButton.textContent = '💾';
        saveButton.title = 'Save';
        saveButton.style.display = 'none';
        this.styleButton(saveButton);
        saveButton.addEventListener('click', async () => {
            // Create or update note object
            noteObj = {
                title: titleInput.value.trim(),
                description: descTextarea.value.trim(),
                createdAt: noteObj.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            leaf.note = noteObj;
            
            // Update display
            noteDisplay.innerHTML = '';
            
            // Create title element
            const titleElement = document.createElement('div');
            titleElement.style.fontWeight = 'bold';
            titleElement.style.fontSize = '16px';
            titleElement.style.marginBottom = '10px';
            titleElement.textContent = noteObj.title;
            noteDisplay.appendChild(titleElement);

            // Create description element
            const descElement = document.createElement('div');
            descElement.style.marginBottom = '15px';
            descElement.textContent = noteObj.description;
            noteDisplay.appendChild(descElement);

            // Create metadata element
            const metaElement = document.createElement('div');
            metaElement.style.fontSize = '11px';
            metaElement.style.color = 'rgba(255, 255, 255, 0.7)';
            metaElement.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
            metaElement.style.paddingTop = '10px';
            metaElement.innerHTML = `Created: ${new Date(noteObj.createdAt).toLocaleString()}<br>Last updated: ${new Date(noteObj.updatedAt).toLocaleString()}`;
            noteDisplay.appendChild(metaElement);
            
            editContainer.style.display = 'none';
            noteDisplay.style.display = 'block';
            editButton.style.display = 'block';
            saveButton.style.display = 'none';
            await this.saveData();
        });

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.title = 'Delete';
        this.styleButton(deleteButton);
        deleteButton.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this leaf?')) {
                const index = this.tree.leaves.indexOf(leaf);
                if (index !== -1) {
                    this.tree.leaves.splice(index, 1);
                    await this.saveData();
                    panel.remove();
                    this.activePanel = null;
                    this.draw();
                    return;
                }
            }
        });

        // Close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '✕';
        closeButton.title = 'Close';
        this.styleButton(closeButton);
        closeButton.addEventListener('click', () => {
            panel.remove();
            this.activePanel = null;
        });

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(deleteButton);
        buttonContainer.appendChild(closeButton);

        panel.appendChild(noteDisplay);
        panel.appendChild(editContainer);
        panel.appendChild(buttonContainer);
        document.body.appendChild(panel);
        this.activePanel = panel;
    }

    handleMouseDown(e) {
        const mousePos = this.getMousePosition(e);
        // Prevent any action if clicking the seed and the tree is empty
        if (this.tree.branches.length === 0 && this.isClickOnSeed(mousePos)) {
            return;
        }
        this.lastMousePos = mousePos;

        // Check if we're clicking on a node
        const clickedBranch = this.tree.branches.find(branch => branch.containsPoint(mousePos.x, mousePos.y));
        if (clickedBranch) {
            // Only allow dragging if we clicked on a node
            if ((!clickedBranch.parent || clickedBranch.parent.children[0] === clickedBranch) || 
                (clickedBranch.children.length === 0)) {
                clickedBranch.startDragging();
                this.isDragging = true;
                this.draggedBranch = clickedBranch;
                e.preventDefault();
                e.stopPropagation();
            }
            return;
        }

        // If we're not clicking on a node, don't do anything
        // This prevents the grey dot from following the cursor
        return;
    }

    handleMouseMove(e) {
        const mousePos = this.getMousePosition(e);

        if (this.isDragging && this.draggedBranch) {
            const dx = mousePos.x - this.lastMousePos.x;
            const dy = mousePos.y - this.lastMousePos.y;
            this.draggedBranch.moveIntersection(dx, dy, this.tree);
            this.draw();
        } else if (this.isCreatingBranch && this.previewBranch) {
            // Only update preview if we're actively creating a branch
            this.previewBranch.endX = mousePos.x;
            this.previewBranch.endY = mousePos.y;
            this.draw();
        }

        this.lastMousePos = mousePos;
    }

    handleMouseUp(e) {
        if (this.isDragging) {
            this.draggedBranch.stopDragging();
            this.isDragging = false;
            this.draggedBranch = null;
            this.saveData();
        } else if (this.isCreatingBranch) {
            const mousePos = this.getMousePosition(e);

            // Don't create a branch if we're too close to the start point
            if (this.distance(this.previewBranch.startX, this.previewBranch.startY, mousePos.x, mousePos.y) < 10) {
                this.isCreatingBranch = false;
                this.previewBranch = null;
                this.draw();
                return;
            }

            // Create the new branch
            const newBranch = new Branch(
                this.previewBranch.startX,
                this.previewBranch.startY,
                mousePos.x,
                mousePos.y
            );

            // Add the branch to the tree
            this.tree.addBranch(newBranch);

            // Reset creation state
            this.isCreatingBranch = false;
            this.previewBranch = null;
            this.saveData();
            this.draw();
        }
    }

    async saveData() {
        try {
            // Validate node data before sending
            const nodes = this.tree.nodes.map(node => {
                if (!node || typeof node.x !== 'number' || typeof node.y !== 'number') {
                    console.error('Invalid node data:', node);
                    throw new Error(`Invalid node data: x and y must be numbers, got x=${typeof node.x}, y=${typeof node.y}`);
                }
                return {
                    id: node.id,
                    x: Number(node.x),
                    y: Number(node.y)
                };
            });

            const treeData = {
                scale: this.tree.scale,
                offset: this.tree.offset,
                nodes: nodes,
                branches: this.tree.branches.map(branch => ({
                    startNode: branch.startNode.id,
                    endNode: branch.endNode.id,
                    thickness: Number(branch.thickness)
                })),
                leaves: this.tree.leaves.map(leaf => ({
                    x: Number(leaf.x),
                    y: Number(leaf.y),
                    note: leaf.note,
                    branchAngle: Number(leaf.branchAngle || 0),
                    leafIndex: Number(leaf.leafIndex || 0),
                    totalLeaves: Number(leaf.totalLeaves || 1),
                    scale: Number(leaf.scale || 1),
                    rotation: Number(leaf.rotation || 0)
                }))
            };
            
            console.log('Saving tree data:', JSON.stringify(treeData, null, 2));
            const savedTree = await this.api.saveTree(treeData);
            console.log('Tree saved successfully:', savedTree);
            
            // Update local IDs with server IDs
            if (savedTree.nodes) {
                savedTree.nodes.forEach((node, index) => {
                    if (this.tree.nodes[index]) {
                        this.tree.nodes[index].id = node._id;
                    }
                });
            }
            
            if (savedTree.branches) {
                savedTree.branches.forEach((branch, index) => {
                    if (this.tree.branches[index]) {
                        this.tree.branches[index].id = branch._id;
                    }
                });
            }
            
            if (savedTree.leaves) {
                savedTree.leaves.forEach((leaf, index) => {
                    if (this.tree.leaves[index]) {
                        this.tree.leaves[index].id = leaf._id;
                    }
                });
            }
        } catch (error) {
            console.error('Error saving data:', error);
            if (error.message === 'Invalid token') {
                localStorage.removeItem('authToken');
                this.authToken = null;
                this.showAuthPanel();
            }
            throw error;
        }
    }

    async loadData() {
        try {
            console.log('Loading tree data...');
            const treeData = await this.api.getTree();
            console.log('Tree data received:', treeData);
            
            // Clear existing data
            this.tree.branches = [];
            this.tree.leaves = [];
            this.tree.nodes = [];
            
            // Load nodes
            if (treeData.nodes && Array.isArray(treeData.nodes)) {
                treeData.nodes.forEach(nodeData => {
                    const node = new Node(nodeData.x, nodeData.y);
                    node.id = nodeData._id;
                    this.tree.nodes.push(node);
                });
            }
            
            // Load branches
            if (treeData.branches && Array.isArray(treeData.branches)) {
                treeData.branches.forEach(branchData => {
                    const startNode = this.tree.nodes.find(n => n.id === branchData.startNode._id);
                    const endNode = this.tree.nodes.find(n => n.id === branchData.endNode._id);
                    if (startNode && endNode) {
                        const branch = new Branch(startNode, endNode);
                        branch.thickness = branchData.thickness;
                        branch.id = branchData._id;
                        this.tree.branches.push(branch);
                    }
                });
            }
            
            // Load leaves
            if (treeData.leaves && Array.isArray(treeData.leaves)) {
                treeData.leaves.forEach(leafData => {
                    try {
                        const note = typeof leafData.note === 'string' ? 
                            JSON.parse(leafData.note) : leafData.note;
                        const leaf = new Leaf(
                            leafData.x,
                            leafData.y,
                            note,
                            leafData.branchAngle,
                            leafData.leafIndex,
                            leafData.totalLeaves
                        );
                        leaf.scale = leafData.scale;
                        leaf.rotation = leafData.rotation;
                        leaf.id = leafData._id;
                        this.tree.leaves.push(leaf);
                    } catch (error) {
                        console.error('Error loading leaf:', error);
                    }
                });
            }
            
            // Set tree properties
            this.tree.scale = treeData.scale;
            this.tree.offset = treeData.offset;
            
            console.log('Tree data loaded successfully');
            this.draw();
        } catch (error) {
            console.error('Error loading data:', error);
            if (error.message === 'Invalid token') {
                localStorage.removeItem('authToken');
                this.authToken = null;
                this.showAuthPanel();
            } else {
                // If no tree exists, create a new one
                await this.api.createTree();
            }
        }
    }

    animate() {
        this.draw();
        requestAnimationFrame(this.animate.bind(this));
    }

    findIntersection(mousePos) {
        if (this.tree.branches.length === 0) return null;
        
        // Get all intersections from all branches
        let allIntersections = [];
        this.tree.branches.forEach(branch => {
            allIntersections = allIntersections.concat(branch.getAllIntersections());
        });
        
        // Find the closest intersection within tolerance
        let closest = null;
        let minDistance = Infinity;
        
        allIntersections.forEach(intersection => {
            const dx = mousePos.x - intersection.x;
            const dy = mousePos.y - intersection.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= 10 && distance < minDistance) {
                minDistance = distance;
                closest = intersection.branch;
            }
        });
        
        return closest;
    }

    showMoveIcon(target, mousePos, type) {
        // Remove any existing move icon
        this.removeMoveIcon();

        const screenX = (type === 'node' ? target.startX : target.x) * this.tree.scale + this.tree.offset.x;
        const screenY = (type === 'node' ? target.startY : target.y) * this.tree.scale + this.tree.offset.y;

        const icon = document.createElement('div');
        icon.style.position = 'absolute';
        icon.style.left = `${screenX - 15}px`;
        icon.style.top = `${screenY - 15}px`;
        icon.style.width = '30px';
        icon.style.height = '30px';
        icon.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        icon.style.border = '1px solid rgb(255, 255, 255)';
        icon.style.borderRadius = '50%';
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.justifyContent = 'center';
        icon.style.cursor = 'move';
        icon.style.zIndex = '1000';
        icon.innerHTML = '✥'; // Move icon
        icon.style.color = 'rgb(255, 255, 255)';
        icon.style.fontSize = '16px';

        let isDragging = false;
        let startX, startY;

        icon.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            if (type === 'node') {
                target.startDragging();
            } else {
                target.startDragging();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const dx = (e.clientX - startX) / this.tree.scale;
            const dy = (e.clientY - startY) / this.tree.scale;
            
            if (type === 'node') {
                target.moveIntersection(dx, dy);
            } else {
                target.move(dx, dy);
            }
            
            // Update icon position
            icon.style.left = `${parseFloat(icon.style.left) + dx * this.tree.scale}px`;
            icon.style.top = `${parseFloat(icon.style.top) + dy * this.tree.scale}px`;
            
            startX = e.clientX;
            startY = e.clientY;
            
            this.draw();
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                if (type === 'node') {
                    target.stopDragging();
                } else {
                    target.stopDragging();
                }
                this.saveData();
            }
        });

        document.body.appendChild(icon);
        this.moveIcon = icon;
    }

    removeMoveIcon() {
        if (this.moveIcon) {
            this.moveIcon.remove();
            this.moveIcon = null;
        }
    }

    deleteBranch(branch) {
        // Show confirmation dialog
        if (confirm('Are you sure you want to delete this branch and all its children?')) {
            // Count total descendants before deletion for thickness calculation
            const totalDescendantsBefore = branch.countTotalDescendants();

            // Remove all leaves attached to this branch and its children
            const removeLeaves = (b) => {
                // Remove leaves at this branch's nodes
                this.tree.leaves = this.tree.leaves.filter(leaf => 
                    !(Math.abs(leaf.x - b.startX) < 1 && Math.abs(leaf.y - b.startY) < 1) &&
                    !(Math.abs(leaf.x - b.endX) < 1 && Math.abs(leaf.y - b.endY) < 1)
                );
                // Remove leaves from children
                b.children.forEach(child => removeLeaves(child));
            };
            removeLeaves(branch);

            // Remove all child branches recursively
            const removeChildren = (b) => {
                // First remove all children's children
                b.children.forEach(child => removeChildren(child));
                // Then remove this branch from the tree's branches array
                const index = this.tree.branches.indexOf(b);
                if (index !== -1) {
                    this.tree.branches.splice(index, 1);
                }
            };
            removeChildren(branch);

            // Remove the branch from its parent
            if (branch.parent) {
                branch.parent.removeChild(branch);
                // Update thickness for all branches up to root
                let currentBranch = branch.parent;
                while (currentBranch) {
                    // Recalculate thickness based on remaining descendants
                    const remainingDescendants = currentBranch.countTotalDescendants();
                    const thicknessReduction = totalDescendantsBefore - remainingDescendants;
                    currentBranch.thickness = Math.max(2, currentBranch.thickness - (thicknessReduction * 0.5));
                    currentBranch = currentBranch.parent;
                }
            } else {
                // If it's a root branch, remove it from the tree
                const index = this.tree.branches.indexOf(branch);
                if (index !== -1) {
                    this.tree.branches.splice(index, 1);
                }
            }

            // Close the options panel
            if (this.activePanel) {
                this.activePanel.remove();
                this.activePanel = null;
            }

            this.draw();
            this.saveData();
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('treeCanvas');
    const api = new API();
    const treeNote = new TreeNote(canvas, api);
}); 