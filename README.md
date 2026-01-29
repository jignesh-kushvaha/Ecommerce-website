# E-commerce Website

A full-stack e-commerce website built with modern web technologies.

## Project Structure

![ecomerce-diagram](https://github.com/user-attachments/assets/a2767443-03ef-40cd-bb97-0fb92cc67843)
_Generated using [gitdiagram](https://gitdiagram.com/)_

The project is divided into two main parts:

### Frontend
- Built with React.js and Vite
- Uses Tailwind CSS for styling
- Modern and responsive UI design

### Backend
- Node.js/Express.js server
- MongoDB database
- RESTful API architecture
- JWT authentication
- File upload capabilities

## Features

- User authentication and authorization
- Product management
- Shopping cart functionality
- Order processing
- Admin dashboard
- File upload for product images
- Responsive design for all devices

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- ESLint for code quality

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Multer for file uploads

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [your-repository-url]
```

2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

3. Install Backend Dependencies
```bash
cd backend
npm install
```

4. Environment Setup
- Create a `.env` file in the backend directory
- Add necessary environment variables (see backend/README.md for details)

### Running the Application

1. Start the Backend Server
```bash
cd backend
npm start
```

2. Start the Frontend Development Server
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Documentation

API documentation is available in the Postman collection file: `backend/Test.postman_collection.json`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
