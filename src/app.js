require('dotenv').config();

const express = require('express');
const app = express();
const router = express.Router();
const cookies = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');
const PORT = process.env.PORT || 3000;

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const profileRouter = require('./routes/profile');
const textRouter = require('./routes/text');
const decksRouter = require('./routes/decks');

// middleware
app.use(methodOverride('_method'));
app.use(cookies());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// routes
app.use('/', authRouter);
app.use('/admin/users', usersRouter);
app.use('/profile', profileRouter);
app.use('/text', textRouter);
app.use('/decks', decksRouter);

app.listen(PORT, () => console.log(`🌐 Server running on Port: ${PORT}`));