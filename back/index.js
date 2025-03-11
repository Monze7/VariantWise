const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();
require('dotenv').config();
require('./db/config');

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: process.env.Secret_Key,
  resave: false,
  saveUninitialized: false
}));

app.use('/api', require('./routes/auth'));

app.get('/', (req, res) => {
  res.send('Node server is running');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));