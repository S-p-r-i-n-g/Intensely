import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import exercisesRoutes from './routes/exercises.routes';
import objectivesRoutes from './routes/objectives.routes';
import workoutsRoutes from './routes/workouts.routes';
import usersRoutes from './routes/users.routes';
import workoutFlowsRoutes from './routes/workout-flows.routes';
import workoutHistoryRoutes from './routes/workout-history.routes';
import favoritesRoutes from './routes/favorites.routes';
import progressRoutes from './routes/progress.routes';
import ratingsRoutes from './routes/ratings.routes';
import workoutSessionRoutes from './routes/workout-session.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API root
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Intensely API Server',
    version: '1.0.0',
    endpoints: {
      exercises: '/api/exercises',
      objectives: '/api/objectives',
      workouts: '/api/workouts',
      users: '/api/users',
      flows: '/api/flows',
      history: '/api/history',
      favorites: '/api/favorites',
      progress: '/api/progress',
      ratings: '/api/ratings',
      sessions: '/api/sessions',
      health: '/health'
    }
  });
});

// API routes
app.use('/api/exercises', exercisesRoutes);
app.use('/api/objectives', objectivesRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/flows', workoutFlowsRoutes);
app.use('/api/history', workoutHistoryRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/sessions', workoutSessionRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
