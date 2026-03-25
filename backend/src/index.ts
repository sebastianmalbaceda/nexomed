// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patients.routes';
import bedRoutes from './routes/beds.routes';
import careRoutes from './routes/careRecords.routes';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/cares', careRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NexoMed backend corriendo en puerto ${PORT}`));