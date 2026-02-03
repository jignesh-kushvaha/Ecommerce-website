# E-commerce Website (Electronics/Mobile Focus)

A full-stack e-commerce platform built with modern web technologies, specialized for electronics (mobile phones) with a production-ready PostgreSQL database, strong security, and scalable architecture.

## 🚀 QUICK START

**Phase 1 (Database & Security) is COMPLETE.** Get started in 5 minutes:

```bash
# 1. Update database credentials in backend/config.env
# 2. Initialize database and seed sample data
cd backend
npm run setup

# 3. Start the server
npm start
```

For detailed setup instructions, see [README_PHASE_1.md](README_PHASE_1.md)

---

## 📚 Documentation

### Phase 1: Database & Security ✅ COMPLETE

- [README_PHASE_1.md](README_PHASE_1.md) - Quick start guide and overview
- [backend/PHASE_1_COMPLETE.md](backend/PHASE_1_COMPLETE.md) - Detailed implementation report
- [backend/QUICK_START.js](backend/QUICK_START.js) - Interactive setup checklist

### Phase 2: Code Quality (In Progress)

- Service layer extraction
- Request validation integration
- Logger integration across all endpoints
- Rate limiting on API routes
- Transaction-based inventory locking

### Phase 3: Features & Polish (Planned)

- Email notifications (order confirmation, status updates)
- Audit logging on all entities
- Swagger/OpenAPI documentation
- Product query optimization
- Comprehensive testing

---

## 🎯 MVP Focus: Electronics → Mobile

Refined from full e-commerce to specialized mobile phone store:

- **Categories**: Electronics (extensible to Laptops, Headphones, etc.)
- **Products**: iPhone, Samsung, Google, OnePlus (4 flagship models)
- **Variants**: Color, Storage, RAM combinations (20 SKUs created)
- **Inventory Management**: Real-time stock tracking with transaction locking
- **Payment**: Secure payment method recording (no card storage)

See [architecture review](backend/PHASE_1_COMPLETE.md#Architecture) for detailed decisions.

---

## 🏗️ Project Structure

```
.
├── backend/
│   ├── config/
│   │   ├── database.js           (Sequelize PostgreSQL config)
│   │   └── init.js               (Database initialization)
│   ├── Models/                   (9 Sequelize models)
│   ├── Controllers/              (Updated for PostgreSQL)
│   ├── Middlewares/              (Auth, logging, validation, rate limit)
│   ├── Utils/                    (Logger, error handling)
│   ├── scripts/                  (Database init, seeding)
│   ├── config.env                (PostgreSQL credentials)
│   ├── index.js                  (Express app)
│   ├── package.json              (Dependencies + scripts)
│   ├── PHASE_1_COMPLETE.md       (Implementation details)
│   └── QUICK_START.js            (Setup guide)
│
├── frontend/
│   ├── src/
│   │   ├── components/           (React components)
│   │   ├── pages/                (Route pages)
│   │   ├── services/             (API calls)
│   │   ├── context/              (State management)
│   │   └── config/               (API configuration)
│   ├── package.json
│   └── vite.config.js
│
├── README.md                      (This file)
├── README_PHASE_1.md             (Phase 1 quick reference)
└── QUICK_START.js                (Setup checklist)
```

---

## 🛡️ Security & Quality

### Phase 1 Achievements ✅

- **Database**: PostgreSQL with Sequelize ORM (ACID transactions)
- **Password Security**: 8+ chars with complexity requirements enforced
- **Card Storage**: REMOVED (PCI-DSS Level 1 compliant)
- **Idempotency**: UUID keys prevent duplicate orders
- **Inventory Locking**: Transaction-based stock management
- **Audit Logging**: All changes tracked in audit_logs table
- **Rate Limiting**: Middleware ready for route integration
- **Validation**: Joi schemas created for all endpoints
- **Environment Config**: Centralized .env configuration
- **Logging**: Centralized logger service across application

### Test Credentials (Seeded)

```
Admin:    admin@ecommerce.com / admin123456
Customer: customer@ecommerce.com / customer123456
```

---

## 📊 Tech Stack

### Frontend

- React 19.0.0
- Vite 6.2.0 (build)
- Tailwind CSS 3.4.1
- Ant Design 5.24.6
- Axios (API client)
- React Router DOM

### Backend

- Node.js / Express.js 4.21.2
- **PostgreSQL** (relational database)
- **Sequelize 8.x** (ORM - UPDATED from Mongoose)
- JWT (authentication)
- bcrypt (password hashing)
- Joi (request validation)
- express-rate-limit (rate limiting)
- Nodemailer (email)
- Multer (file uploads)
- Winston (logging structure)

---

## 🚦 How to Run

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure database
cp .env.example config.env
# Edit config.env with your PostgreSQL credentials

# 3. Initialize database
npm run init-db

# 4. Seed sample data
npm run seed

# 5. Start server
npm start
# Server runs on http://localhost:8001
```

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure API endpoint (if needed)
# Edit src/config/apiConfig.js

# 3. Start development server
npm run dev
# UI runs on http://localhost:5173
```

---

## 📝 API Endpoints

### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Products

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders

- `POST /api/orders` - Place new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status (admin)

### User

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/change-password` - Change password

See [Postman collection](backend/Test.postman_collection.json) for detailed API testing.

---

## 📋 npm Scripts

```bash
npm start              # Start server with nodemon
npm run init-db        # Initialize database (create tables)
npm run seed           # Seed sample data (4 products, 20 variants)
npm run setup          # init-db + seed (complete setup)
npm run lint           # Run ESLint
```

---

## 🔄 Development Workflow

### Phase 1 (Completed)

✅ Database migration to PostgreSQL
✅ Security hardening (passwords, card storage removal)
✅ Model relationships and schema
✅ Authentication layer updates
✅ Error handling and logging infrastructure

### Phase 2 (Ready to Start)

⏳ Service layer extraction (ProductService, OrderService, etc.)
⏳ Request validation on all routes
⏳ Comprehensive logging integration
⏳ Transaction-based inventory locking
⏳ Rate limiting on API endpoints

### Phase 3 (Planned)

⏳ Email notifications
⏳ Audit log triggers
⏳ Swagger documentation
⏳ Testing suite

---

## 🐛 Troubleshooting

### Database Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure PostgreSQL is running and credentials in `config.env` are correct.

### Password Validation Error

```
Error: Password must contain uppercase, lowercase, number, and special character
```

**Solution**: Use password like `Test@1234` (meets all requirements).

### npm Package Issues

```
npm install --legacy-peer-deps
```

See [README_PHASE_1.md](README_PHASE_1.md#troubleshooting) for more help.

---

## 📖 Additional Resources

- [Sequelize Documentation](https://sequelize.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

## ✨ Contributors

- **Jignesh Kushvaha** - Full-stack development, architecture refactoring, PostgreSQL migration

---

## 🎓 What You'll Learn

- Full-stack e-commerce application architecture
- PostgreSQL database design and optimization
- Sequelize ORM and model relationships
- JWT authentication and security best practices
- React + Express integration
- RESTful API design
- Transaction-based inventory management
- Production-ready code patterns

---

**Last Updated**: Phase 1 Complete - Database & Security
**Status**: 🟢 Ready for Phase 2 implementation

For detailed progress, see [PHASE_1_COMPLETE.md](backend/PHASE_1_COMPLETE.md)

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
