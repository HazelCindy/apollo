const { gql } = require("apollo-server-koa");

const typeDefs = gql`
  scalar Date

  enum Region {
    africa
  }

  type Query {
    "get all the Columns"
    getColumns: [Column]
    "get all tasks"
    getTasks(columnId: String): [Task]
  }

  type Mutation {
    "Mutation to add a column to Board"
    addColumn(title: String): Column
    "Mutation to add a task to a column"
    addTask(description: String, columnId: String!): Task
    "Update Column"
    updateColumn(id: ID!, title: String): Column
    "Update Task"
    updateTask(id: ID!, description: String, columnId: String): Task
    "Delete Column"
    deleteColumn(id: ID!): Boolean
    "Delete Task"
    deleteTask(id: ID!): Boolean
    "Clear column"
    clearColumnTasks(columnId: String!): Boolean
  }

  "Type for a task on the Column"
  type Task {
    id: ID!
    description: String!
    columnId: String!
  }

  "Column that is displayed on the column"
  type Column {
    id: ID!
    title: String
  }
`;

module.exports = typeDefs;
