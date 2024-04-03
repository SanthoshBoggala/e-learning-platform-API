// index.js
const express = require('express');
const pool = require('./db'); // Import the connectDB function from db.js
require('dotenv').config();

// Load environment variables
const { PORT } = process.env;

// Create an Express app
const app = express();
app.use(express.json());

const userRoutes = require('./Routes/userRoutes');
const courseRoutes = require('./Routes/courseRoutes');
const enrollRoutes = require('./Routes/enrollmentRoutes');

app.get('/', (req, res) => {
  res.send('Welcome to the homepage!');
});

// Define a route
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enroll', enrollRoutes);

// Start the server function
const startServer = async() => {
  try {
    await pool.connect(); // Connect to the database
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1); 
  }
}

startServer();
