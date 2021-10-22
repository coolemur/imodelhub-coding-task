import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { Request, Response } from 'express';

const db = new JsonDB(new Config('configuration', true, false, '/'));

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
  };

  db.push('/configuration', configuration);

  return res.json(configuration);
}
