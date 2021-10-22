import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';

const db = new JsonDB(new Config('configuration', true, false, '/'));

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
