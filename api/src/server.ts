import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport';
import { config, corsConfig } from './config/env';
import authRoutes from './routes/authRoutes';
import creatorRoutes from './routes/creatorRoutes';
import fanRoutes from './routes/fanRoutes';
import profileRoutes from './routes/profileRoutes';
import trackRoutes from './routes/trackRoutes';

const app = express();

// Session middleware (required for Passport)
app.use(session({
  secret: process.env.JWT_SECRET || 'session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/creator', trackRoutes);
app.use('/api/fan', fanRoutes);
app.use('/api', profileRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Groovely Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});