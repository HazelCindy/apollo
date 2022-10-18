const { RESTDataSource } = require("apollo-datasource-rest");
const config = require("dotenv");
const headersConfig = require("../utils/headersConfig");

config.config();
const configValues = process.env;

class Countries extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = configValues.API_ENDPOINT;
    this.timeout = 30000;
  }

  async willSendRequest(request) {
    headersConfig.prototype.basicApiHeaders(request);
  }

  async didReceiveResponse(response) {
    const apiResponse = await response.json();
    return apiResponse;
  }

  async getCountries(args) {
    const { param } = args;
    let path = `v3.1/all`;
    if (param && param !== "") {
      path = `v3.1/name/${param}`;
    }
    const response = await this.get(path, {}, { timeout: this.timeout });
    return response && Array.isArray(response) && response.length > 0
      ? response.map((item) => Countries.countriesReducer(item))
      : [];
  }

  static countriesReducer(item) {
    return {
      country: item.name.common,
    };
  }
}

module.exports = Countries;
