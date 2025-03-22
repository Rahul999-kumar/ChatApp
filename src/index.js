import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { Filter } from 'bad-words';
import { generateMessage } from './utils/messages.js';
import { generateLocationMessage } from './utils/messages.js';
import { addUser } from './utils/users.js';
import { getUser } from './utils/users.js';
import { getUsersInRoom } from './utils/users.js';
import { removeUser } from './utils/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const server = http.createServer(app);
const io = new Server(server);


const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Admin', 'Welcome!'));
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });



  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    if (!user) {
      return callback('User not found');
    }
    const filter = new Filter()
    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }
    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);
    if (!user) {
      return callback('User not found');
    }
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }


  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});