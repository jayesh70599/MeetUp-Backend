// server.js
import 'dotenv/config'; // Loads .env file
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db.js'; // Note the .js extension
import socketHandler from './sockets/socketHandler.js'; // Note the .js extension
import authRoutes from './routes/authRoutes.js'; // Note the .js extension
import meetingRoutes from './routes/meetingRoutes.js'; // Note the .js extension

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust this for your frontend URL in production
  },
});

// Socket.IO Connection
socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));