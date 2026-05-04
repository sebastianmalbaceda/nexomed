// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patients.routes';
import bedRoutes from './routes/beds.routes';
import careRoutes from './routes/careRecords.routes';
import medicationRoutes from './routes/medications.routes';
import notificationRoutes from './routes/notifications.routes';
import incidentRoutes from './routes/incidents.routes';
import diagnosticTestRoutes from './routes/diagnosticTests.routes';
import drugRoutes from './routes/drugs.routes';
import scheduleRoutes from './routes/schedule.routes';
import userRoutes from './routes/users.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();
const app = express();

// CORS: solo permitir origen configurado (AGENTS.md rule)
const corsOptions = {
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/cares', careRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/tests', diagnosticTestRoutes);
app.use('/api/drugs', drugRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/users', userRoutes);

// Global error handler (must be last middleware)
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, () => console.log(`NexoMed backend corriendo en puerto ${PORT}`));

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = PORT + 1;
    console.log(`Puerto ${PORT} ocupado, usando ${fallbackPort}...`);
    server.listen(fallbackPort, () => console.log(`NexoMed backend corriendo en puerto ${fallbackPort}`));
  } else {
    console.error('Error al iniciar el servidor:', err.message);
    process.exit(1);
  }
});
