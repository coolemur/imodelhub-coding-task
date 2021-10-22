import { Request, Response } from 'express';
import db from '../db';

export function get(req: Request, res: Response): Response<unknown, Record<string, unknown>> | undefined {
  const configuration = db.getData('/configuration');
  return res.json(configuration);
}

export function post(req: Request, res: Response): Response<unknown, Record<string, unknown>> | undefined {
  const configuration: ConfigurationInput = req.body;

  if (!configuration.routes || !configuration.clients) {
    return res.status(400).json({
      error: 'Invalid configuration',
    });
  }

  db.push('/configuration', configuration);

  return res.json(configuration);
}
