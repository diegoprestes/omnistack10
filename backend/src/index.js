const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');

const routes = require('./routes');
const { setupWebsocket } = require('./websocket');

const app = express();
const server = http.Server(app);

setupWebsocket(server);

const DB_USER = 'omnistack';
const DB_PASS = 'omnistack';
const DB_DATABASE = 'week10';
mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASS}@cluster0-i7jak.mongodb.net/${DB_DATABASE}?retryWrites=true&w=majority`, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.json());
app.use(routes);

server.listen(3333);