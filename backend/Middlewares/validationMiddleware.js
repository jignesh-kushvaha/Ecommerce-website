import Joi from "joi";
import AppError from "../Utils/appError.js";
import loggerService from "../Utils/logger.js";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (error) {
      loggerService.warn(`Validation error: ${error.message}`);
      const message = error.details.map((d) => d.message).join(", ");
      return next(new AppError(message, 400));
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
    name: Joi.string().required().min(2).max(255),
    email: Joi.string().email().required(),
    password: Joi.string()
      .required()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/,
      ),
    phoneNumber: Joi.string()
      .optional()
      .pattern(/^\d{10}$/),
    address: Joi.object().optional(),
  }).required(),
});

export const loginValidation = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
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
          productId: Joi.string().required(),
          quantity: Joi.number().required().min(1),
        }),
      )
      .required(),
    shippingAddress: Joi.object({
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
