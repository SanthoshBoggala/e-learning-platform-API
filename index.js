// index.js
const express = require('express');
const { connectDB } = require('./db'); // Import the connectDB function from db.js
require('dotenv').config();

// Load environment variables
const { PORT } = process.env;

// Create an Express app
const app = express();

// Define a route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Start the server function
async function startServer() {
  try {
    const db = await connectDB(); // Connect to the database
    // Start the server if the database connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1); // Exit the process if there's an error
  }
}

// Call the startServer function to start the server
startServer();
