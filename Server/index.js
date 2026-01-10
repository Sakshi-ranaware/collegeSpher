// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const hodRoutes = require('./src/routes/hodRoutes');
const principalRoutes = require('./src/routes/principalRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
const path = require('path');
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hod', hodRoutes);
app.use('/api/principal', principalRoutes);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Leaving Certificate API' });
});

// Database & Server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/college_certificates';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
