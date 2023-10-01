import { format, createLogger, transports } from "winston";

const { combine, timestamp, label, printf, prettyPrint } = format;
const CATEGORY = "winston custom format";

const logger = createLogger({
  level: "debug", // Logging level set to debug
  format: combine(
    label({ label: CATEGORY }), // Adds a label to the log entries
    timestamp({
      format: "YYYY-MM-DDTHH:mm:ss", // Timestamp format
    }),
    prettyPrint() // Pretty print the log entries
  ),
  transports: [
    // Define transports to specify where logs should be written
    new transports.File({
      filename: "logs/info.log", // Log to a file named info.log
    }),
    new transports.File({
      level: "error", // Log only error level and above to this transport
      filename: "logs/error.log", // Log to a file named error.log
    }),
    new transports.Console(), // Log to the console as well
  ],
});

export default logger; // Export the configured logger
