class API {
    constructor() {
        this.baseUrl = '/api/tree';
    }

    async getTree() {
        try {
            console.log('Fetching tree data...');
            const response = await fetch(this.baseUrl);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`Failed to fetch tree: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log('Tree data received:', data);
            return data;
        } catch (error) {
            console.error('Error fetching tree:', error);
            throw error;
        }
    }

    async saveTree(treeData) {
        try {
            console.log('Saving tree data...');
            const response = await fetch(this.baseUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(treeData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`Failed to save tree: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log('Tree saved successfully:', data);
            return data;
        } catch (error) {
            console.error('Error saving tree:', error);
            throw error;
        }
    }

    async createTree() {
        try {
            console.log('Creating new tree...');
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    scale: 1,
                    offset: { x: 0, y: 0 },
                    nodes: [],
                    branches: [],
                    leaves: []
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`Failed to create tree: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log('New tree created:', data);
            return data;
        } catch (error) {
            console.error('Error creating tree:', error);
            throw error;
        }
    }
} 