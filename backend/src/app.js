const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const { errorHandler } = require('./middlewares/errorHandler');

// import routes
const authRoutes = require('./routes/authRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const narrativeRoutes = require('./routes/narrativeRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/narratives', narrativeRoutes);
app.get("/", (req, res) => {
    res.send("Faculty Activity Tracker API running");
});
// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
