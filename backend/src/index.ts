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
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();
const app = express();

// CORS: solo permitir origen configurado (AGENTS.md rule)
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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

// Global error handler (must be last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NexoMed backend corriendo en puerto ${PORT}`));
