// db.js
const { Client } = require('pg');
require('dotenv').config();

// Load environment variables
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

// Create a new PostgreSQL client instance
const client = new Client({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    // SSL configuration (change as needed)
    rejectUnauthorized: false, // Change this depending on your SSL setup
    ca: [Buffer.from(`project=${ENDPOINT_ID}`)] // Connection options
  }
});

// Function to connect to the PostgreSQL database
async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to the database');
    return client;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error; // Re-throw the error for handling in index.js
  }
}

module.exports = { connectDB };
