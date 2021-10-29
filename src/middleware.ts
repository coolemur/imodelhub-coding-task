import { Request, Response, NextFunction } from 'express';
import * as db from './db';

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
  const configuration = db.getConfiguration();

  const client: Client | undefined = configuration && configuration.clients ? configuration.clients.find((c: Client) => c.clientId === clientId) : undefined;

  if (!configuration) {
    res.status(500).send('Invalid configuration data.');
  } else if (!clientId) {
    res.status(400).send('Bad Request');
  } else if (!client) {
    res.status(403).send('Forbidden');
  } else if (isTooManyRequests(client)) {
    res.status(429).send('Too Many Requests');
  } else {
    saveClient(client);
    next();
  }
}

function setClientDefaults(client: Client) {
  if (client.limit === undefined) {
    client.limit = 1;
  }

  if (client.seconds === undefined) {
    client.seconds = 1;
  }
}

/*
  This function is used to check if the client has exceeded the maximum number of requests in a given time period.
  Client request count is reset when the time period has elapsed.
*/

function isTooManyRequests(client: Client): boolean {
  setClientDefaults(client);

  const limit = client.limit === undefined ? 1 : client.limit;
  const milliseconds = client.seconds === undefined ? 1 : client.seconds * 1000;
  const now = new Date().getTime();

  if (limit === 0) return true;

  if (client.firstRequest === undefined) {
    client.firstRequest = now;
    return false;
  }

  const elapsed = now - client.firstRequest;

  if (elapsed > milliseconds) {
    client.firstRequest = now;
    return false;
  }

  if (client.requests === undefined) {
    client.requests = 1;
  }

  return client.requests >= limit;
}

/*
  This function is used to update the client's data in data.json.
*/
function saveClient(client: Client) {
  if (client.requests) {
    client.requests++;
  }

  const configuration = db.getConfiguration();
  if (configuration) {
    const index = configuration.clients.findIndex((c: Client) => c.clientId === client.clientId);
    configuration.clients[index] = client;
    db.setConfiguration(configuration);
  } else {
    throw new Error('Invalid configuration data.');
  }
}