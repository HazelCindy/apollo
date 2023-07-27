const { RESTDataSource } = require("apollo-datasource-rest");
const config = require("dotenv");

config.config();

let Columns = [];

class Column extends RESTDataSource {
  async getColumns() {
    return Columns;
  }

  async addColumn(args) {
    const { title: paramName } = args;
    const idExists = Columns.some(
      (column) => column.id === String(Columns.length + 1)
    );
    const newColumn = {
      id: idExists ? String(Columns.length + 2) : String(Columns.length + 1),
      title: paramName,
    };
    Columns.push(newColumn);
    return newColumn;
  }

  async updateColumn(args) {
    const { id, title } = args;
    // Get the index of column to be updated
    const updatedColumnIndex = Columns.findIndex((column) => {
      return column.id === id;
    });
    if (updatedColumnIndex !== -1) {
      Columns[updatedColumnIndex].title = title;
      return Columns[updatedColumnIndex];
    }
    return null;
  }
  async deleteColumn(args) {
    const { id } = args;
    // Get the index of column to be updated
    const updatedColumnIndex = Columns.findIndex((column) => {
      return column.id === id;
    });
    if (updatedColumnIndex !== -1) {
      Columns.splice(updatedColumnIndex, 1);
      return true;
    }
    return false;
  }
}

module.exports = Column;
