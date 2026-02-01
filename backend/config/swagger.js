import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description:
        "Complete REST API for E-Commerce platform with product management, user authentication, orders, and inventory management",
      contact: {
        name: "API Support",
        email: "support@ecommerce.com",
      },
      license: {
        name: "ISC",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.ecommerce.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token required for authentication",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            user_type: { type: "string", enum: ["admin", "customer"] },
            phone_number: { type: "string" },
            profile_image_url: { type: "string" },
            street: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            country: { type: "string" },
            postal_code: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            slug: { type: "string" },
            description: { type: "string" },
            brand: { type: "string" },
            base_price: { type: "number", format: "decimal" },
            category_id: { type: "integer" },
            is_active: { type: "boolean" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer" },
            user_id: { type: "integer" },
            status: {
              type: "string",
              enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
            },
            payment_method: {
              type: "string",
              enum: ["credit_card", "paypal", "bank_transfer"],
            },
            payment_status: {
              type: "string",
              enum: ["pending", "completed", "failed"],
            },
            total_price: { type: "number", format: "decimal" },
            shipping_address: { type: "object" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: [
    "./Routers/authRoutes.js",
    "./Routers/productRoutes.js",
    "./Routers/orderRoutes.js",
    "./Routers/userRoutes.js",
    "./Routers/adminRoutes.js",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
