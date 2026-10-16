require('dotenv').config();
const express = require('express');
const app = express();
const cookies = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');
const PORT = process.env.PORT || 3000;

const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const decksRouter = require('./routes/decks');
const profileRouter = require('./routes/profile');
const usersRouter = require('./routes/users');

// Middleware
app.use(methodOverride('_method'));
app.use(cookies());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', authRouter);
app.use('/home', indexRouter);
app.use('/decks', decksRouter);
app.use('/profile', profileRouter);
app.use('/admin/users', usersRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ msg: 'Healthy' });
});

app.listen(PORT, async () => {
  console.log(`🌐 Server running on Port: ${PORT}`);
});