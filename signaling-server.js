const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let waitingUser = null;

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('find-partner', () => {
    if (waitingUser) {
      // Pair the current user with the waiting user
      io.to(socket.id).emit('partner-found', { partnerId: waitingUser.id });
      io.to(waitingUser.id).emit('partner-found', { partnerId: socket.id });
      waitingUser = null; // Reset waitingUser
    } else {
      waitingUser = socket; // Set current user as the waiting user
    }
  });

  socket.on('offer', (data) => {
    io.to(data.partnerId).emit('offer', data.offer);
  });

  socket.on('answer', (data) => {
    io.to(data.partnerId).emit('answer', data.answer);
  });

  socket.on('ice-candidate', (data) => {
    io.to(data.partnerId).emit('ice-candidate', data.candidate);
  });

  socket.on('disconnect', () => {
    if (waitingUser === socket) {
      waitingUser = null;
    }
  });
});

server.listen(3000, () => {
  console.log('Signaling server listening on port 3000');
});