import sequelize from "../config/database.js";
import loggerService from "./logger.js";

/**
 * Execute a function within a database transaction
 * Automatically rolls back on error
 */
export const withTransaction = async (callback) => {
  const transaction = await sequelize.transaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    loggerService.debug("Transaction committed successfully");
    return result;
  } catch (error) {
    await transaction.rollback();
    loggerService.warn("Transaction rolled back due to error");
    throw error;
  }
};

/**
 * Execute multiple async operations with automatic transaction
 */
export const executeInTransaction = async (operations) => {
  return withTransaction(async (transaction) => {
    const results = [];
    for (const operation of operations) {
      const result = await operation(transaction);
      results.push(result);
    }
    return results;
  });
};

export default { withTransaction, executeInTransaction };
