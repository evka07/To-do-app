const express = require('express');
const app = express();
const socket = require('socket.io');
const path = require('path');

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running...');
});
app.use(express.static(path.join(__dirname, '/client/build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
});
const io = socket(server);

let tasks = [];

io.on('connection', socket => {
  socket.emit('updateData', tasks);

  socket.on('addTask', newTask => {
    tasks.push(newTask);
    socket.broadcast.emit('addTask', newTask);
  });

  socket.on('removeTask', taskId => {
    tasks = tasks.filter(task => task.id !== taskId);
    socket.broadcast.emit('removeTask', taskId);
  });
});

app.use((req, res) => {
  res.status(404).send({ message: 'Not found...' });
});
