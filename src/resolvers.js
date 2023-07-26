const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");

module.exports = {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value; // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      throw new Error("Please pass a date");
    },
  }),
  Region: {
    africa: "africa",
  },
  Query: {
    getColumns: (_, __, { dataSources }) => dataSources.columns.getColumns(),
    getTasks: (_, args, { dataSources }) => dataSources.tasks.getTasks(args),
  },
  Mutation: {
    // Column mutations
    addColumn: (_, args, { dataSources }) =>
      dataSources.columns.addColumn(args),
    updateColumn: (_, args, { dataSources }) =>
      dataSources.columns.updateColumn(args),
    deleteColumn: (_, args, { dataSources }) =>
      dataSources.columns.deleteColumn(args),
    // Tasks Mutations
    addTask: (_, args, { dataSources }) => dataSources.tasks.addTask(args),
    updateTask: (_, args, { dataSources }) =>
      dataSources.tasks.updateTask(args),
    deleteTask: (_, args, { dataSources }) =>
      dataSources.tasks.deleteTask(args),
    clearColumnTasks: (_, args, { dataSources }) =>
      dataSources.tasks.clearColumnTasks(args),
  },
};
