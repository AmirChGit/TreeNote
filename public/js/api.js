class API {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = localStorage.getItem('authToken');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async verifyEmail(email, code) {
        return this.request('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ email, code })
        });
    }

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    async verifyToken() {
        return this.request('/auth/verify-token', {
            method: 'GET'
        });
    }

    async saveTree(treeData) {
        return this.request('/tree', {
            method: 'POST',
            body: JSON.stringify(treeData)
        });
    }

    async getTree() {
        return this.request('/tree', {
            method: 'GET'
        });
    }

    async createTree() {
        return this.request('/tree', {
            method: 'POST',
            body: JSON.stringify({
                scale: 1,
                offset: { x: 0, y: 0 },
                nodes: [],
                branches: [],
                leaves: []
            })
        });
    }
} 