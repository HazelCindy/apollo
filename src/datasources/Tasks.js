const { RESTDataSource } = require("apollo-datasource-rest");
const config = require("dotenv");

config.config();

let Tasks = [];

class Task extends RESTDataSource {
  async getTasks(args) {
    const { columnId } = args;
    if (Tasks.length > 0) {
      const tasks = Tasks.filter((task) => task.columnId === columnId);
      return tasks;
    }
    return [];
  }

  async addTask(args) {
    const { description, columnId } = args;
    // addTask to column
    const newTask = {
      id: String(Tasks.length + 1),
      description,
      columnId,
    };
    Tasks.push(newTask);
    return newTask;
  }

  async updateTask(args) {
    const { id, description, columnId } = args;
    // Get the index of column to be updated
    const updatedTaskIndex = Tasks.findIndex((task) => {
      return task.id === id;
    });
    if (updatedTaskIndex !== -1) {
      Tasks[updatedTaskIndex].description = description;
      Tasks[updatedTaskIndex].columnId = columnId;
      return Tasks[updatedTaskIndex];
    }
    return null;
  }

  async deleteTask(args) {
    const { id } = args;
    // Get the index of column to be updated
    const updatedTaskIndex = Tasks.findIndex((task) => {
      return task.id === id;
    });
    if (updatedTaskIndex !== -1) {
      Tasks.splice(updatedTaskIndex, 1);
      return true;
    }
    return false;
  }

  async clearColumnTasks(args) {
    const { columnId } = args;
    // Get the index of column to be cleared
    if (columnId !== "") {
      Tasks = Tasks.filter(({ columnId }) => columnId !== columnId);
      return true;
    }
    return false;
  }
}

module.exports = Task;
