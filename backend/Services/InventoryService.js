import Inventory from "../Models/Inventory.js";
import ProductVariant from "../Models/ProductVariant.js";
import AppError from "../Utils/appError.js";
import loggerService from "../Utils/logger.js";

class InventoryService {
  /**
   * Get inventory for a variant
   */
  async getInventoryByVariantId(variantId) {
    try {
      const inventory = await Inventory.findOne({
        where: { variantId },
        include: [{ model: ProductVariant }],
      });

      if (!inventory) {
        throw new AppError("Inventory not found", 404);
      }

      loggerService.log(`Retrieved inventory for variant ${variantId}`);
      return inventory;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(
        `Error getting inventory for variant ${variantId}`,
        error,
      );
      throw new AppError("Failed to fetch inventory", 500);
    }
  }

  /**
   * Check if item is in stock
   */
  async isInStock(variantId, quantity = 1) {
    try {
      const inventory = await Inventory.findOne({ where: { variantId } });
      if (!inventory) {
        return false;
      }

      const availableQuantity =
        inventory.quantityAvailable - inventory.quantityReserved;
      loggerService.debug(
        `Checked stock for variant ${variantId}: ${availableQuantity} available`,
      );
      return availableQuantity >= quantity;
    } catch (error) {
      loggerService.error(
        `Error checking stock for variant ${variantId}`,
        error,
      );
      throw new AppError("Failed to check inventory", 500);
    }
  }

  /**
   * Get available quantity for variant
   */
  async getAvailableQuantity(variantId) {
    try {
      const inventory = await Inventory.findOne({ where: { variantId } });
      if (!inventory) {
        throw new AppError("Inventory not found", 404);
      }

      const available =
        inventory.quantityAvailable - inventory.quantityReserved;
      loggerService.debug(
        `Available quantity for variant ${variantId}: ${available}`,
      );
      return available;
    } catch (error) {
      loggerService.error(
        `Error getting available quantity for variant ${variantId}`,
        error,
      );
      throw new AppError("Failed to fetch availability", 500);
    }
  }

  /**
   * Reserve inventory (for pending orders)
   * Used when order is placed
   */
  async reserveInventory(variantId, quantity, transaction = null) {
    try {
      const inventory = await Inventory.findOne(
        { where: { variantId } },
        transaction ? { transaction } : {},
      );

      if (!inventory) {
        throw new AppError("Inventory not found", 404);
      }

      const availableQuantity =
        inventory.quantityAvailable - inventory.quantityReserved;
      if (availableQuantity < quantity) {
        throw new AppError(
          `Insufficient stock. Available: ${availableQuantity}`,
          400,
        );
      }

      await inventory.increment(
        "quantityReserved",
        { by: quantity },
        transaction ? { transaction } : {},
      );

      loggerService.log(`Reserved ${quantity} units of variant ${variantId}`);
      return inventory;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(
        `Error reserving inventory for variant ${variantId}`,
        error,
      );
      throw new AppError("Failed to reserve inventory", 500);
    }
  }

  /**
   * Confirm inventory (move from reserved to sold)
   * Used when order payment succeeds
   */
  async confirmInventory(variantId, quantity, transaction = null) {
    try {
      const inventory = await Inventory.findOne(
        { where: { variantId } },
        transaction ? { transaction } : {},
      );

      if (!inventory) {
        throw new AppError("Inventory not found", 404);
      }

      if (inventory.quantityReserved < quantity) {
        throw new AppError("Invalid inventory operation", 400);
      }

      // Decrease available and reserved
      await inventory.decrement(
        "quantityAvailable",
        { by: quantity },
        transaction ? { transaction } : {},
      );
      await inventory.decrement(
        "quantityReserved",
        { by: quantity },
        transaction ? { transaction } : {},
      );

      loggerService.log(`Confirmed ${quantity} units of variant ${variantId}`);
      return inventory;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(
        `Error confirming inventory for variant ${variantId}`,
        error,
      );
      throw new AppError("Failed to confirm inventory", 500);
    }
  }

  /**
   * Cancel/Release reserved inventory
   * Used when order is cancelled
   */
  async releaseInventory(variantId, quantity, transaction = null) {
    try {
      const inventory = await Inventory.findOne(
        { where: { variantId } },
        transaction ? { transaction } : {},
      );

      if (!inventory) {
        throw new AppError("Inventory not found", 404);
      }

      if (inventory.quantityReserved < quantity) {
        throw new AppError("Invalid inventory operation", 400);
      }

      await inventory.decrement(
        "quantityReserved",
        { by: quantity },
        transaction ? { transaction } : {},
      );

      loggerService.log(`Released ${quantity} units of variant ${variantId}`);
      return inventory;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(
        `Error releasing inventory for variant ${variantId}`,
        error,
      );
      throw new AppError("Failed to release inventory", 500);
    }
  }

  /**
   * Get all low stock items (below threshold)
   */
  async getLowStockItems(threshold = 5) {
    try {
      const lowStockItems = await Inventory.findAll({
        where: {
          [sequelize.Op.lt]: sequelize.where(
            sequelize.col("quantityAvailable"),
            "-",
            sequelize.col("quantityReserved"),
            threshold,
          ),
        },
        include: [{ model: ProductVariant }],
      });

      loggerService.log(`Found ${lowStockItems.length} low stock items`);
      return lowStockItems;
    } catch (error) {
      loggerService.error("Error getting low stock items", error);
      throw new AppError("Failed to fetch low stock items", 500);
    }
  }

  /**
   * Update inventory quantity
   */
  async updateInventory(variantId, quantityAvailable) {
    try {
      const inventory = await Inventory.findOne({ where: { variantId } });
      if (!inventory) {
        throw new AppError("Inventory not found", 404);
      }

      await inventory.update({ quantityAvailable });
      loggerService.log(
        `Updated inventory for variant ${variantId} to ${quantityAvailable}`,
      );
      return inventory;
    } catch (error) {
      if (error instanceof AppError) throw error;
      loggerService.error(
        `Error updating inventory for variant ${variantId}`,
        error,
      );
      throw new AppError("Failed to update inventory", 500);
    }
  }
}

export default new InventoryService();
