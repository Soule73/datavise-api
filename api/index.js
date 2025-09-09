const path = require('path');

// Import the compiled Express app
const app = require(path.join(__dirname, '..', 'dist', 'index.js'));

// Export as serverless function
module.exports = app.default || app;
