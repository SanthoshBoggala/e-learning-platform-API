# Project Overview:

The goal of this project is to develop a robust backend API for an e-learning platform. The API will facilitate user registration, user profile management, course management (including CRUD operations for superadmin), and user enrollment functionalities. Additionally, the courses API will implement filtering and pagination to enhance user experience. The project will utilize the free tier of neon.tech database for data storage and resend.com's free tier for handling email communications.

## Project Requirements:

1. **User APIs**:
    - **User Registration**: Allow users to register by providing necessary details such as name, email, and password. Implement validation for email uniqueness and password strength.
    - **User Profile**: Enable users to view and update their profile information, including name, email, profile picture, and any other relevant details.
2. **Course APIs**:
    - **Get Courses**: Provide an API endpoint to fetch courses available on the platform. Implement filtering options based on parameters such as category, level, popularity, etc. Enable pagination to handle large datasets efficiently.
    - **CRUD Operations for Superadmin**: Implement Create, Read, Update, and Delete operations for courses. Only superadmin users should have permission to perform these operations.
3. **User Enrollment APIs**:
    - **Course Enrollment**: Allow users to enroll in courses they are interested in. Implement validation to ensure users can't enroll in the same course multiple times.
    - **View Enrolled Courses**: Provide an API endpoint for users to view the courses they have enrolled in.
4. **Filters and Pagination**:
    - Implement filtering options for the courses API to enable users to refine their search based on criteria such as category, level, etc.
    - Enable pagination to limit the number of results returned per request and improve performance when dealing with large datasets.
5. **Database and Email Integration**:
    - Utilize the free tier of neon.tech database for storing user information, course details, and enrollment data.
    - Integrate with resend.com's free tier for handling email communications, such as user registration confirmation, password reset requests, and course enrollment notifications.
6. **Security and Authentication**:
    - Implement secure authentication mechanisms, such as JWT (JSON Web Tokens), to authenticate users for accessing protected endpoints.
    - Ensure sensitive data, such as passwords, is securely hashed before storage in the database.
7. **Error Handling and Logging**:
    - Implement robust error handling mechanisms to provide meaningful error messages to clients.
    - Utilize logging to track API requests, responses, and any potential errors or exceptions for debugging purposes.

## Technologies Used:

- **Backend Framework**: Node.js with Express.js
- **Database**: neon.tech (PostgreSQL)
- **Email Service**: resend.com
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Error Handling**: Custom middleware and logging libraries

## Getting Started:

To get started with the project, follow these steps:

1. Clone the repository to your local machine.
2. Install dependencies using `npm install`.
3. Set up the neon.tech database and configure the connection in the project.
4. Set up an account with resend.com for email integration and configure the credentials in the project.
5. Add your jwt secret key, Hashsalts, domain, resend key, required neon.tech postgreSQL details and the desired port to a `.env` file in the project root directory before running `npm start`. Example `.env` file content:
6. Run the server using `npm start`.
7. Explore the API endpoints using tools like Postman or curl or thunder client.

## Contributors:

- Boggala Santhosh
