import nodemailer from "nodemailer";
import loggerService from "./logger.js";

class EmailService {
  constructor() {
    // Configure nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: process.env.SMTP_PORT || 1025,
      secure: process.env.SMTP_SECURE === "true" || false,
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(email, order, user) {
    try {
      const itemsList = order.OrderItems.map(
        (item) =>
          `<li>${item.ProductVariant.product.name} (${item.quantity}x) - $${(item.price * item.quantity).toFixed(2)}</li>`,
      ).join("");

      const htmlContent = `
        <h2>Order Confirmation</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for your order! Here are your order details:</p>
        
        <h3>Order #${order.id}</h3>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Payment Status:</strong> ${order.payment_status}</p>
        
        <h3>Items:</h3>
        <ul>
          ${itemsList}
        </ul>
        
        <h3>Total: $${order.total_price.toFixed(2)}</h3>
        
        <h3>Shipping Address:</h3>
        <p>${order.shipping_address.street}</p>
        <p>${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}</p>
        <p>${order.shipping_address.country}</p>
        
        <p>You can track your order status at any time by logging into your account.</p>
        <p>Thank you for shopping with us!</p>
      `;

      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@ecommerce.com",
        to: email,
        subject: `Order Confirmation - Order #${order.id}`,
        html: htmlContent,
      });

      loggerService.log(`Order confirmation email sent to ${email}`, {
        order_id: order.id,
      });
      return result;
    } catch (error) {
      loggerService.error(
        `Failed to send order confirmation to ${email}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(email, order, user, newStatus) {
    try {
      const statusMessages = {
        shipped: "Your order is on its way! Track your package below.",
        delivered:
          "Your order has been delivered. We hope you enjoy your purchase!",
        cancelled:
          "Your order has been cancelled. If you did not request this, please contact us.",
      };

      const htmlContent = `
        <h2>Order Status Update</h2>
        <p>Dear ${user.name},</p>
        
        <p>Your order #${order.id} status has been updated to: <strong>${newStatus}</strong></p>
        <p>${statusMessages[newStatus.toLowerCase()] || "Your order status has been updated."}</p>
        
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Status:</strong> ${newStatus}</p>
        <p><strong>Total:</strong> $${order.total_price.toFixed(2)}</p>
        
        <p>Log in to your account to view more details about your order.</p>
        <p>Thank you for shopping with us!</p>
      `;

      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@ecommerce.com",
        to: email,
        subject: `Order #${order.id} - ${newStatus}`,
        html: htmlContent,
      });

      loggerService.log(`Order status update email sent to ${email}`, {
        order_id: order.id,
        status: newStatus,
      });
      return result;
    } catch (error) {
      loggerService.error(
        `Failed to send order status email to ${email}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(email, order, user) {
    try {
      const htmlContent = `
        <h2>Payment Confirmed</h2>
        <p>Dear ${user.name},</p>
        
        <p>Your payment has been successfully processed.</p>
        
        <h3>Payment Details:</h3>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Amount:</strong> $${order.total_price.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> ${order.payment_method}</p>
        <p><strong>Payment Status:</strong> Completed</p>
        
        <p>Your order will be prepared for shipment shortly.</p>
        <p>Thank you for your purchase!</p>
      `;

      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@ecommerce.com",
        to: email,
        subject: `Payment Confirmed - Order #${order.id}`,
        html: htmlContent,
      });

      loggerService.log(`Payment confirmation email sent to ${email}`, {
        order_id: order.id,
      });
      return result;
    } catch (error) {
      loggerService.error(
        `Failed to send payment confirmation to ${email}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email, userName) {
    try {
      const htmlContent = `
        <h2>Welcome to Our Store!</h2>
        <p>Hello ${userName},</p>
        
        <p>Thank you for creating an account with us. We're excited to have you as part of our community!</p>
        
        <h3>Getting Started:</h3>
        <ul>
          <li>Browse our collection of products</li>
          <li>Add items to your cart</li>
          <li>Proceed to checkout when ready</li>
          <li>Track your orders in real-time</li>
        </ul>
        
        <p>If you have any questions or need assistance, our customer support team is here to help.</p>
        <p>Happy shopping!</p>
      `;

      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@ecommerce.com",
        to: email,
        subject: "Welcome to Our Store!",
        html: htmlContent,
      });

      loggerService.log(`Welcome email sent to ${email}`);
      return result;
    } catch (error) {
      loggerService.error(`Failed to send welcome email to ${email}`, error);
      // Don't throw - welcome email failure shouldn't block registration
      loggerService.warn(`Welcome email failed but continuing: ${email}`);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, resetToken, resetUrl) {
    try {
      const htmlContent = `
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <p><a href="${resetUrl}?token=${resetToken}">Reset Your Password</a></p>
        
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request this, please ignore this email.</p>
        
        <p>Thank you</p>
      `;

      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@ecommerce.com",
        to: email,
        subject: "Password Reset Request",
        html: htmlContent,
      });

      loggerService.log(`Password reset email sent to ${email}`);
      return result;
    } catch (error) {
      loggerService.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Test email configuration
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      loggerService.log("Email service connected successfully");
      return true;
    } catch (error) {
      loggerService.warn("Email service connection failed", error);
      return false;
    }
  }
}

export default new EmailService();
