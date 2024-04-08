require('dotenv').config();

const express = require('express');
const pool = require('./db'); 

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

const port = process.env.PORT || 3000;
// Start the server function
const startServer = async() => {
  try {
    await pool.connect(); // Connect to the database
    app.listen( port , () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1); 
  }
}

startServer();
