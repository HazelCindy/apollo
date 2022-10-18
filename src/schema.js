const { gql } = require("apollo-server-koa");

const typeDefs = gql`
  scalar Date

  enum Region {
    africa
  }

  type Query {
    getCountries(param: String): [Countries]
    getName: Name
  }

  type Mutation {
    writeName(name: String!): Boolean!
  }

  type Countries {
    country: String
  }

  type Name {
    name: String!
  }
`;

module.exports = typeDefs;
