const { RESTDataSource } = require("apollo-datasource-rest");
const config = require("dotenv");
const convertKeys = require("../utils/convertKeys");

config.config();
const configValues = process.env;

class Countries extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = configValues.API_ENDPOINT;
    this.timeout = 30000;
  }

  async getCountries(args) {
    const { param } = args;
    let path = `rest/v2/all`;
    if (param && param !== "") {
      path = `rest/v2/name/${param}`;
    }
    const response = await this.get(path, {}, { timeout: this.timeout });
    const serializedResponse = convertKeys(response);
    console.log(serializedResponse);
    return serializedResponse &&
      Array.isArray(serializedResponse) &&
      serializedResponse.length > 0
      ? serializedResponse.map((item) => Countries.countriesReducer(item))
      : [];
  }

  static countriesReducer(item) {
    return {
      country: item.name,
      region: item.region,
    };
  }
}

module.exports = Countries;
