const { createLogger, format } = require("winston");
const DailyLog = require("winston-daily-rotate-file");
const _ = require("lodash");
const config = require("dotenv");
const AWS = require("aws-sdk");
const WinstonCloudWatch = require("winston-cloudwatch");
const getTimeStamp = require("./getTimestamp");

const { combine, timestamp, label, printf } = format;

config.config();
const configValues = process.env;

AWS.config.update({
  region: configValues.AWS_REGION,
});

const logStringBuilder = (meta, message, level) => {
  let logString = `${getTimeStamp()}|message=${message}|level=${level}`;

  if ("url" in meta) {
    logString = `${logString}|url=${meta.url}`;
    delete meta.url;
  }

  if ("request" in meta) {
    logString = `${logString}|request=${meta.request}`;
    delete meta.request;
  }

  if ("email" in meta) {
    logString = `${logString}|email=${meta.email}`;
    delete meta.email;
  }

  if ("technicalMessage" in meta) {
    logString = `${logString}|technicalMessage=${meta.technicalMessage}`;
    delete meta.technicalMessage;
  }
  // Add customer error
  const selectableErrors = [
    "customerMessage",
    "customError",
    "message",
    "actualError",
    "systemError",
  ];
  const pipeSpecial = (errors) => {
    _.forOwn(errors, (value, key) => {
      if (typeof value === "object") {
        pipeSpecial(value);
      } else if (selectableErrors.indexOf(key) >= 0) {
        logString = `${logString}|${key} =${value}`;
      }
    });
  };
  pipeSpecial(meta);

  logString = `${logString}\n`;

  return logString;
};

const timezoned = () =>
  new Date().toLocaleString("en-US", {
    timeZone: "Africa/Nairobi",
  });

const logFormat = printf(
  ({ level, message, ...meta }) => `${logStringBuilder(meta, message, level)}`
);

const logFilePath = configValues.LOGGING_PATH;
let logger;
if (configValues.ENVIRONMENT === "fileBased") {
  logger = createLogger({
    transports: [
      new DailyLog({
        filename: logFilePath,
        datePattern: "YYYY-MM-DD",
      }),
    ],
    format: combine(
      label({ label: "Drift Node Server" }),
      timestamp({
        format: timezoned,
      }),
      logFormat
    ),
  });
}
if (configValues.ENVIRONMENT === "aws") {
  logger = createLogger({
    transports: [
      new WinstonCloudWatch({
        logGroupName: "identity",
        logStreamName: "identity-dev",
        awsAccessKeyId: configValues.AWS_ACCESS_KEY_ID,
        awsSecretKey: configValues.AWS_SECRET_ACCESS_KEY,
        awsRegion: configValues.AWS_REGION,
        jsonMessage: true,
        messageFormatter: ({ level, message, ...meta }) =>
          `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(meta)}}`,
      }),
    ],
  });
}

module.exports = logger;
