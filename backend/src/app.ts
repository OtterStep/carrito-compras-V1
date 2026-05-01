import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Simple Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: '*', // O tu URL de frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Root route for health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'API del Carrito de Compras activa 🚀',
    version: '1.0.0',
    status: 'online'
  });
});

// Routes
app.use('/api', routes);

// Error Handling
app.use(errorHandler);

export default app;
