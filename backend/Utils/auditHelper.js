import AuditLog from "../Models/AuditLog.js";
import loggerService from "./logger.js";

/**
 * Create audit log entry
 */
export async function createAuditLog(
  entityType,
  entityId,
  action,
  changedBy = null,
  oldValues = null,
  newValues = null,
  transaction = null,
) {
  try {
    const auditData = {
      entity_type: entityType,
      entity_id: entityId,
      action,
      changed_by: changedBy,
      old_values: oldValues,
      new_values: newValues,
    };

    const options = transaction ? { transaction } : {};

    await AuditLog.create(auditData, options);

    loggerService.log(`Audit log created for ${entityType} ${entityId}`, {
      action,
      changed_by: changedBy,
    });
  } catch (error) {
    loggerService.error(
      `Failed to create audit log for ${entityType} ${entityId}`,
      error,
    );
    // Don't throw - audit failure shouldn't block the main operation
  }
}

/**
 * Setup audit hooks for a model
 */
export function setupAuditHooks(Model, entityType) {
  // Create hook
  Model.afterCreate(async (instance, options) => {
    try {
      await createAuditLog(
        entityType,
        instance.id,
        "create",
        null, // No user context in afterCreate hook
        null,
        instance.dataValues,
        options.transaction,
      );
    } catch (error) {
      loggerService.error(`Audit hook error for ${entityType} create`, error);
    }
  });

  // Update hook
  Model.afterUpdate(async (instance, options) => {
    try {
      const oldValues = {};
      const newValues = {};

      // Track only changed fields
      const changedFields = instance.changed();
      if (changedFields && changedFields.length > 0) {
        changedFields.forEach((field) => {
          oldValues[field] = instance._previousDataValues[field];
          newValues[field] = instance.dataValues[field];
        });

        await createAuditLog(
          entityType,
          instance.id,
          "update",
          null, // No user context in afterUpdate hook
          oldValues,
          newValues,
          options.transaction,
        );
      }
    } catch (error) {
      loggerService.error(`Audit hook error for ${entityType} update`, error);
    }
  });

  // Delete hook
  Model.afterDestroy(async (instance, options) => {
    try {
      await createAuditLog(
        entityType,
        instance.id,
        "delete",
        null, // No user context in afterDestroy hook
        instance.dataValues,
        null,
        options.transaction,
      );
    } catch (error) {
      loggerService.error(`Audit hook error for ${entityType} delete`, error);
    }
  });
}

export default {
  createAuditLog,
  setupAuditHooks,
};
