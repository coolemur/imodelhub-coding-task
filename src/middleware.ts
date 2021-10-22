import { Request, Response, NextFunction } from 'express';
import db from './db';

export function verifyAdmins(req: Request, res: Response, next: NextFunction, admins: Array<string>): void {
  const clientId = req.headers['client-id'] as string;

  if (!clientId) {
    res.status(400).send('Bad Request');
  } else if (!admins.includes(clientId)) {
    res.status(403).send('Forbidden');
  } else {
    next();
  }
}

export function verifyClient(req: Request, res: Response, next: NextFunction): void {
  const clientId = req.headers['client-id'] as string;
  const configuration = db.getData('/configuration');
  const client = configuration.clients.find((c: Client) => c.clientId === clientId);

  if (!clientId) {
    res.status(400).send('Bad Request');
  } else if (!client) {
    res.status(403).send('Forbidden');
  } else {
    next();
  }
}