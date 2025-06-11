# TreeNote - Interactive Tree-Based Note-Taking Application

TreeNote is a unique note-taking application that organizes notes in a tree structure, where each note is represented as a leaf on a branch. The application provides an intuitive visual interface for creating, organizing, and managing notes in a hierarchical structure.

🌐 [Live Demo](https://treenote.onrender.com)

![TreeNote Interface](screenshots/treeNote.png)

## Features

- 🌳 Interactive tree visualization with drag-and-drop functionality
- 📝 Beautiful leaf-shaped notes with subtle variations
- 🔄 Real-time updates and persistence
- 📱 Responsive design for both desktop and mobile
- 🔐 Secure user authentication with email verification
- 🎨 Dynamic branch thickness based on content
- 🔍 Zoom and pan capabilities for easy navigation
- 💾 Automatic saving of your tree structure

## Tech Stack

- **Frontend:**
  - HTML5 Canvas for tree visualization
  - Vanilla JavaScript for interactivity
  - Responsive CSS for mobile compatibility

- **Backend:**
  - Node.js with Express.js
  - MongoDB for data persistence
  - JWT for authentication
  - Nodemailer for email verification

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AmirChGit/TreeNote.git
   cd TreeNote
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   PORT=3000
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   ```

4. Start the application:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## Usage Guide

### Creating Notes
1. Click on a branch to add a new leaf
2. Enter your note content
3. The leaf will be automatically positioned and styled

### Organizing Notes
1. Drag branches to reorganize the tree structure
2. Add new branches by connecting nodes
3. The tree will automatically adjust branch thickness

### Navigation
1. Drag the canvas to pan
2. Use the mouse wheel to zoom
3. The view will automatically center on the tree

### Mobile Usage
1. Open the app in your mobile browser
2. Add to home screen for a native app experience
3. Use touch gestures for interaction:
   - Pinch to zoom
   - Drag to pan
   - Tap to create/edit notes

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/verify-email` - Verify user email
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify-token` - Verify JWT token

### Tree Operations
- `GET /api/tree` - Get user's tree structure
- `POST /api/tree` - Save tree structure

## Project Structure

```
TreeNote/
├── public/              # Frontend files
│   ├── index.html      # Main HTML file
│   ├── js/            # JavaScript files
│   │   ├── api.js     # API client
│   │   ├── Tree.js    # Tree visualization
│   │   ├── Node.js    # Node management
│   │   ├── Branch.js  # Branch management
│   │   └── Leaf.js    # Note management
├── server/             # Backend files
│   ├── models/        # MongoDB models
│   └── routes/        # API routes
├── server.js          # Main server file
└── package.json       # Project dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## Contact

Amir Chachoui - [GitHub](https://github.com/AmirChGit)

Project Link: [https://github.com/AmirChGit/TreeNote](https://github.com/AmirChGit/TreeNote)
