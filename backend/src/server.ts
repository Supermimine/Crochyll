import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes de base
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    success: true,
    status: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// À ajouter : importer et utiliser les routes
// import healthRoutes from './routes/health';
// import productRoutes from './routes/products';
// import emailRoutes from './routes/email';
// app.use('/api', healthRoutes);
// app.use('/api', productRoutes);
// app.use('/api', emailRoutes);

// Middleware pour les erreurs 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// Middleware d'erreur global
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`🌐 CORS enabled for: ${FRONTEND_URL}`);
  console.log(`📝 Node Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
