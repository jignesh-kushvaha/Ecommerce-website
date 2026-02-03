import Joi from "joi";
import AppError from "../Utils/appError.js";
import loggerService from "../Utils/logger.js";
import { Json } from "sequelize/lib/utils";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate({
      body: req.body,
    });

    if (error) {
      console.log("error", JSON.stringify(error, null, 2));
      loggerService.warn(`Validation error===: ${error.message}`);
      // Return detailed validation errors
      const validationErrors = error.details.map((d) => ({
        field: d.context.label || d.path.join("."),
        message: d.message,
      }));

      return res.status(400).json({
        status: "error",
        message: error.message,
        errors: JSON.stringify(validationErrors),
      });
    }

    // Replace request data with validated data
    req.body = value.body || req.body;
    req.params = value.params || req.params;
    req.query = value.query || req.query;

    next();
  };
};

// Auth validators
export const registerValidation = Joi.object({
  body: Joi.object({
    name: Joi.string().required().min(2).max(255).label("Name"),
    email: Joi.string().email().required().label("Email"),
    password: Joi.string()
      .required()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/,
      )
      .messages({
        "string.pattern.base":
          "Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)",
        "string.min":
          "Password must be at least 8 characters long and Use 1 uppercase, 1 lowercase, 1 number, and 1 special character",
      })
      .label("Password"),
    phoneNumber: Joi.string()
      .optional()
      .pattern(/^\d{10}$/)
      .messages({
        "string.pattern.base": "Phone number must be 10 digits",
      })
      .label("Phone Number"),
    address: Joi.object().optional(),
  }).required(),
});

export const loginValidation = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  }).required(),
});

// Product validators
export const createProductValidation = Joi.object({
  body: Joi.object({
    name: Joi.string().required().max(255),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    category: Joi.string().required(),
    stock: Joi.number().required().min(0),
  }).required(),
});

export const updateProductValidation = Joi.object({
  body: Joi.object({
    name: Joi.string().optional().max(255),
    description: Joi.string(),
    price: Joi.number().optional().min(0),
    category: Joi.string(),
    stock: Joi.number().optional().min(0),
  })
    .min(1)
    .required(),
});

// Order validators
export const placeOrderValidation = Joi.object({
  body: Joi.object({
    products: Joi.array()
      .items(
        Joi.object({
          variant_id: Joi.number().required(),
          quantity: Joi.number().required().min(1),
        }),
      )
      .required()
      .min(1),
    shipping_address: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required(),
    }).required(),
    paymentMethod: Joi.string()
      .valid("credit_card", "paypal", "bank_transfer")
      .required(),
  }).required(),
});
