# E-commerce Backend API

This is the backend API for the E-commerce website, built with Node.js, Express, and MongoDB.

## Project Structure

```
backend/
├── Controllers/     # Request handlers
├── Middlewares/    # Custom middleware functions
├── Models/         # Database models
├── Routers/        # API routes
├── Utils/          # Utility functions
├── Constants/      # Constant values
├── Databases/      # Database configuration
├── seeds/          # Database seed data
├── public/         # Static files
└── index.js        # Application entry point
```

## Features

- RESTful API architecture
- JWT-based authentication
- Role-based access control (Admin/User)
- File upload handling
- Error handling middleware
- Input validation
- Database seeding
- API documentation (Postman collection)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository

```bash
git clone [repository-url]
cd backend
```

2. Install dependencies

```bash
npm install
```

3. Create a `config.env` file in the root directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_email
SMTP_PASS=your_email_password
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `PATCH /api/auth/reset-password/:token` - Reset password

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product (Admin only)
- `PATCH /api/products/:id` - Update a product (Admin only)
- `DELETE /api/products/:id` - Delete a product (Admin only)

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get a specific order
- `POST /api/orders` - Create a new order
- `PATCH /api/orders/:id` - Update order status (Admin only)

3. Create a `.env` file and configure the following variables:

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (Admin only)

## API Documentation

A complete Postman collection is available at `Test.postman_collection.json`. Import this file into Postman to test all endpoints.

## Error Handling

The API uses a centralized error handling system. All errors are returned in the following format:

```json
{
  "status": "error",
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected routes:

1. Login to get a token
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer <your_token>
   ```

## File Upload

File uploads are handled using Multer. Supported file types:

- Images (jpg, jpeg, png)
- Maximum file size: 5MB

## Database Seeding

To populate the database with sample data:

```bash
npm run seed
```

## Technologies Used

- Node.js
- Express.js
- MongoDB + Mongoose
- Multer (for image uploads)
- Nodemailer (for email notifications)
- JWT (for authentication)
- ESLint (for code linting)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
