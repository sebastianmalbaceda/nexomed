import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('NexoMed API - Backend Operativo');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NexoMed API is running' });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('Error starting server:', err);
});

export default app;
