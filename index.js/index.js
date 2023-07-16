const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Definir el esquema de GraphQL
const schema = buildSchema(`
  type Task {
    id: ID!
    description: String!
    completed: Boolean!
  }

  type Query {
    tasks: [Task]
    task(id: ID!): Task
  }

  type Mutation {
    createTask(description: String!): Task
    updateTask(id: ID!, description: String, completed: Boolean): Task
    deleteTask(id: ID!): ID
  }
`);

// Almacenamiento temporal de las tareas
const tasks = [];

// Definir resolvers
const root = {
  tasks: () => tasks,
  task: ({ id }) => tasks.find(task => task.id === id),
  createTask: ({ description }) => {
    const task = {
      id: String(tasks.length + 1),
      description,
      completed: false
    };
    tasks.push(task);
    return task;
  },
  updateTask: ({ id, description, completed }) => {
    const task = tasks.find(task => task.id === id);
    if (!task) {
      throw new Error(`No se encontró la tarea con ID: ${id}`);
    }
    if (description) {
      task.description = description;
    }
    if (completed !== undefined) {
      task.completed = completed;
    }
    return task;
  },
  deleteTask: ({ id }) => {
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) {
      throw new Error(`No se encontró la tarea con ID: ${id}`);
    }
    tasks.splice(index, 1);
    return id;
  }
};

// Configuración de la aplicación Express
const app = express();

// Ruta para GraphQL
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true // Habilitar interfaz GraphiQL para probar las consultas
}));

// Iniciar el servidor
const port = 4000;
app.listen(port, () => {
  console.log(`Servidor GraphQL en funcionamiento en http://localhost:${port}/graphql`);
});
