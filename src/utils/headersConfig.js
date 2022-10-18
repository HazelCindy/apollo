const _ = require("lodash");
const config = require("dotenv");
const { v4: uuid } = require("uuid");

config.config();
// const configValues = process.env;

// Some of the headers that are commonly used
const commonHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const addHeader = (request, headerName, headerValue) => {
  request.headers.set(headerName, headerValue);
};

class HeadersConfig {
  headerEnrichment(request) {
    // Add the common headers
    _.forOwn(commonHeaders, (header, name) => {
      addHeader(request, name, header);
    });
  }

  basicApiHeaders(request) {
    const headers = {
      Authorization: "Bearer <Access-Token>",
      "x-correlation-conversationid": uuid(),
    };

    _.forOwn(headers, (header, name) => {
      addHeader(request, name, header);
    });

    // Add the common headers
    _.forOwn(commonHeaders, (header, name) => {
      addHeader(request, name, header);
    });
  }

  // Helper function to generate a basic auth given username:password
  basicAuthHeader(credentials) {
    return `Basic ${Buffer.from(credentials).toString("base64")}`;
  }
}

module.exports = HeadersConfig;
