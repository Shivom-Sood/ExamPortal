require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ConnectDB = require('./config/db.js');
const authRoutes = require('./routes/auth.routes.js');
const userRoutes = require('./routes/user.routes.js');
const questionRoutes = require('./routes/question.routes.js');
const { notFound, errorHandler } = require('./middleware/error.middleware.js');

const app = express();
const port = process.env.PORT || 5050;

// allow the react app (different port) to call this api
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// test route
app.get('/', (req, res) => {
    res.json({ message: 'ExamPortal API is running' });
});

// routes
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', questionRoutes);

// error handling middlewares (always at the end)
app.use(notFound);
app.use(errorHandler);

ConnectDB();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
