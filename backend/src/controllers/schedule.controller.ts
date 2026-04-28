import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getScheduleItems } from '../services/schedule.service';
import { handlePrismaError } from '../lib/errorHandler';
import { getScheduleQuerySchema } from '../validations/schedule.validation';

export const getSchedule = async (req: AuthRequest, res: Response) => {
  const validation = getScheduleQuerySchema.safeParse(req.query);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  try {
    const items = await getScheduleItems(validation.data);
    res.json(items);
  } catch (error) {
    return handlePrismaError(error, res);
  }
};
