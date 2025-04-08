# ProductStore Frontend

This is the frontend for the ProductStore application, a full e-commerce solution built with React, Tailwind CSS, and Ant Design.

## Features

- User authentication (register, login, forgot password)
- Product browsing with filtering and search
- Shopping cart functionality
- Order management
- Product reviews
- Responsive design

## Technologies Used

- React (with Vite)
- React Router for navigation
- Tailwind CSS for styling
- Ant Design for UI components
- Axios for API requests
- Context API for state management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:

   ```
   npm install
   ```

2. Start the development server:

   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Project Structure

- `src/components/` - Reusable components
  - `auth/` - Authentication-related components
  - `layout/` - Layout components (header, footer)
  - `products/` - Product-related components
  - `orders/` - Order-related components
- `src/context/` - React Context providers
- `src/pages/` - Page components
- `src/services/` - API services
- `src/utils/` - Utility functions

## Configuration

The API base URL can be configured in `src/services/api.js`.

## Backend Integration

This frontend is designed to work with the ProductStore backend API. Make sure the backend server is running on the correct port as specified in the API configuration.

## License

MIT
