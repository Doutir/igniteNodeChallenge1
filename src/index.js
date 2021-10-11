const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const {username} = request.headers;
  const [existUser] = users.filter(user =>user.username===username);
  if(!existUser)return response.status(404).json({error:'not found user with this username'})
  request.user = existUser
  next()

}

app.post('/users', (request, response) => {
  const {name,username} = request.body;
  const usernameAlreadyUsed = users.some(user=>user.username===username);
  
  if(usernameAlreadyUsed)return response.status(400).json({error:'username already used'})

  const newUser = { 
    id: uuidv4(), // precisa ser um uuid
    name,
    username,
    todos: []
  }
  users.push(newUser)
  return response.status(200).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const {user} = request;
  return response.status(200).json(user.todos)
  
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const {body:{title,deadline},user} = request;
  const newTodo = { 
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  const newTodoArray = [...user.todos,newTodo];

  const indexUser = users.findIndex(User=>User.username ===user.username);
  users[indexUser].todos=newTodoArray;
  return response.status(201).json(newTodo);


});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { params:{id},user:{todos},body:{title,deadline} } = request;
  const indexOfTodo = todos.findIndex(todo=>todo.id===id);
  if(indexOfTodo===-1) return response.status(404).json({error:'todo not found'})
  const updatedTodo = {
    ...todos[indexOfTodo],
    title,
    deadline
  }
  todos[indexOfTodo] = updatedTodo;

  return response.status(200).json(updatedTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { params:{id},user:{todos} } = request;
  const indexOfTodo = todos.findIndex(todo=>todo.id===id);
  if(indexOfTodo===-1) return response.status(404).json({error:'todo not found'})
  
  const updatedTodo = {
    ...todos[indexOfTodo],
    done: true,
  }
  todos[indexOfTodo] = updatedTodo;

  return response.status(200).json(updatedTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { params:{id},user } = request;
  const indexOfTodo = user.todos.findIndex(todo=>todo.id===id);
  if(indexOfTodo===-1) return response.status(404).json({error:'todo not found'})
  const newTodosArray = user.todos.filter(todo=>todo.id!==id);

  request.user.todos = newTodosArray;

  return response.status(204).end()
});

module.exports = app;