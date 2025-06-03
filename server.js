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

const allowedOrigins = [
  'http://localhost:5173', // Your local frontend for development
  // Add your deployed frontend URL here later, e.g., 'https://your-frontend.vercel.app'
  'https://hilarious-kitten-eb84f1.netlify.app'
];

if (process.env.CORS_ORIGIN) { // For production
    allowedOrigins.push(process.env.CORS_ORIGIN);
}


app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// Middleware
//app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: '*', // Adjust this for your frontend URL in production
//   },
// });

const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Use the same origins
    methods: ["GET", "POST"]
  },
});

// Socket.IO Connection
socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));