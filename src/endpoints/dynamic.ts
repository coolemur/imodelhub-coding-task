import { Request, Response } from 'express';
import axios from 'axios';
import db from '../db';

export async function get(req: Request, res: Response): Promise<Response<unknown, Record<string, unknown>> | undefined> {
  const configuration = db.getData('/configuration');
  const path = `/${req.params.path}`;
  const route = configuration.routes.find((route: Route) => route.sourcePath === path);
  const response = await axios.get(route.destinationUrl);
  return res.json(response.data);
}

export async function post(req: Request, res: Response): Promise<Response<unknown, Record<string, unknown>> | undefined> {
  const configuration = db.getData('/configuration');
  const path = `/${req.params.path}`;
  const route = configuration.routes.find((route: Route) => route.sourcePath === path);
  const response = await axios.post(route.destinationUrl, req.body);
  return res.json(response.data);
}
