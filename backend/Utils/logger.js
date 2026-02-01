import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const LOG_LEVEL = {
  debug: 0,
  log: 1,
  warn: 2,
  error: 3,
};

const logLevel = LOG_LEVEL[process.env.LOG_LEVEL || "debug"];

class LoggerService {
  log(message, data = null) {
    if (logLevel <= LOG_LEVEL.log) {
      if (data) {
        console.log(`[LOG] ${message}`, data);
      } else {
        console.log(`[LOG] ${message}`);
      }
    }
  }

  debug(message, data = null) {
    if (logLevel <= LOG_LEVEL.debug) {
      if (data) {
        console.debug(`[DEBUG] ${message}`, data);
      } else {
        console.debug(`[DEBUG] ${message}`);
      }
    }
  }

  warn(message, data = null) {
    if (logLevel <= LOG_LEVEL.warn) {
      if (data) {
        console.warn(`[WARN] ${message}`, data);
      } else {
        console.warn(`[WARN] ${message}`);
      }
    }
  }

  error(message, error = null) {
    if (logLevel <= LOG_LEVEL.error) {
      if (error) {
        console.error(`[ERROR] ${message}`, error.message || error);
      } else {
        console.error(`[ERROR] ${message}`);
      }
    }
  }
}

export default new LoggerService();
