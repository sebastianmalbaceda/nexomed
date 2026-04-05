// src/controllers/drugs.controller.ts
import { Request, Response } from 'express';
import { searchMedicines, getMedicineDetails } from '../services/cima.service';

// GET /api/drugs/search?q=nombre — buscar medicamentos en CIMA
export const searchDrugs = async (req: Request, res: Response) => {
  const { q } = req.query as { q: string };

  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Término de búsqueda demasiado corto (mínimo 2 caracteres)' });
  }

  try {
    const results = await searchMedicines(q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error al buscar en CIMA' });
  }
};

// GET /api/drugs/:nregistro — obtener detalles de un medicamento
export const getDrugDetails = async (req: Request, res: Response) => {
  const { nregistro } = req.params as { nregistro: string };

  try {
    const details = await getMedicineDetails(nregistro);
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error al obtener detalles de CIMA' });
  }
};
