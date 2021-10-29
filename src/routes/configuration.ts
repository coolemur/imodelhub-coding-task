import { Router, Request, Response } from "express";
import * as db from '../db';
import { verifyAdmins } from "../middleware";

const router = Router();
const admins: Array<string> = db.getAdmins();

// @route GET /configuration
// @desc  Get configuration
// @access By administrators IDs
router.get("/", (req, res, next) => {
  verifyAdmins(req, res, next, admins);
}, (req: Request, res: Response) => {
  const configuration = db.getConfiguration();

  if (!configuration) {
    return res.status(404).json({
      error: 'Invalid configuration data.'
    });
  }

  return res.json(configuration);
});

// @route POST /configuration
// @desc  Set configuration
// @access By administrators IDs
router.post("/", (req, res, next) => {
  verifyAdmins(req, res, next, admins);
}, (req: Request, res: Response) => {
  const configuration: Configuration = req.body;

  if (!configuration.routes || !configuration.clients) {
    return res.status(400).json({
      error: 'Invalid configuration. Configuration must contain routes and clients',
    });
  }

  if (configuration.routes.some(route => route.sourcePath.includes('configuration')) || configuration.routes.some(route => route.sourcePath.includes('configure'))) {
    return res.status(400).json({
      error: 'Invalid configuration. Configuration cannot contain route with sourcePath /configuration',
    });
  }

  if (configuration.clients.some(client => !client.clientId)) {
    return res.status(400).json({
      error: 'Invalid configuration. Clients must contain clientId',
    });
  }

  configuration.clients.forEach(client => {
    if (client.seconds === undefined) {
      client.seconds = 1;
    }
    if (client.limit === undefined) {
      client.limit = 1;
    }
  });

  db.setConfiguration(configuration);

  return res.json(configuration);
});

// ---
// Bonus: CRUD for clients and routes:
// ---

// @route GET /configuration/clients
// @desc  Get clients
// @access By administrators IDs
router.get("/clients", (req, res, next) => {
  verifyAdmins(req, res, next, admins);
}, (req: Request, res: Response) => {
  const configuration = db.getConfiguration();

  if (!configuration) {
    return res.status(500).json({
      error: 'Invalid configuration data.'
    });
  }

  return res.json(configuration.clients);
});

// @route GET /configuration/routes
// @desc  Get routes
// @access By administrators IDs
router.get("/routes", (req, res, next) => {
  verifyAdmins(req, res, next, admins);
}, (req: Request, res: Response) => {
  const configuration = db.getConfiguration();

  if (!configuration) {
    return res.status(500).json({
      error: 'Invalid configuration data.'
    });
  }

  return res.json(configuration.routes);
});

// @route POST /configuration/clients
// @desc  Add client
// @access By administrators IDs
router.post("/clients", (req, res, next) => {
  verifyAdmins(req, res, next, admins);
}, (req: Request, res: Response) => {
  const configuration = db.getConfiguration();
  const client: Client = req.body;

  if (!client.clientId) {
    return res.status(400).json({
      error: 'Invalid client. Client must contain clientId',
    });
  }

  if (!configuration) {
    return res.status(500).json({
      error: 'Invalid configuration data.'
    });
  }

  if (configuration.clients.some(c => c.clientId === client.clientId)) {
    return res.status(400).json({
      error: 'Invalid client. Client with clientId already exists',
    });
  }

  configuration.clients.push(client);
  db.setConfiguration(configuration);

  return res.json(client);
});

// @route POST /configuration/routes
// @desc  Add route
// @access By administrators IDs
router.post("/routes", (req, res, next) => {
  verifyAdmins(req, res, next, admins);
}, (req: Request, res: Response) => {
  const configuration = db.getConfiguration();
  const route: Route = req.body;

  if (!configuration) {
    return res.status(500).json({
      error: 'Invalid configuration data.'
    });
  }

  if (!route.sourcePath) {
    return res.status(400).json({
      error: 'Invalid route. Route must contain sourcePath',
    });
  }

  if (!route.destinationUrl) {
    return res.status(400).json({
      error: 'Invalid route. Route must contain destinationUrl',
    });
  }

  if (configuration.routes.some(r => r.sourcePath === route.sourcePath)) {
    return res.status(400).json({
      error: 'Invalid route. Route with sourcePath already exists',
    });
  }

  configuration.routes.push(route);
  db.setConfiguration(configuration);

  return res.json(route);
});

// @route PUT /configuration/clients/:clientId
// @desc  Update client
// @access By administrators IDs
router.put("/clients/:clientId", (req, res, next) => {
  verifyAdmins(req, res, next, admins);
}, (req: Request, res: Response) => {
  const configuration = db.getConfiguration();
  const client: Client = req.body;
  const clientId = req.params.clientId;

  if (!configuration) {
    return res.status(500).json({
      error: 'Invalid configuration data.'
    });
  }

  if (!clientId) {
    return res.status(400).json({
      error: 'Invalid client. Client must contain clientId',
    });
  }

  const index = configuration.clients.findIndex(c => c.clientId === clientId);
  if (index === -1) {
    return res.status(400).json({
      error: 'Invalid client. Client with clientId does not exist',
    });
  }

  client.clientId = clientId;
  configuration.clients[index] = client;
  db.setConfiguration(configuration);

  return res.json(client);
});

// @route PUT /configuration/routes/:sourcePath
// @desc  Update route
// @access By administrators IDs
router.put("/routes/:sourcePath", (req, res, next) => {
  verifyAdmins(req, res, next, admins);
}, (req: Request, res: Response) => {
  const configuration = db.getConfiguration();
  const route: Route = req.body;
  const sourcePath = `/${req.params.sourcePath}`;

  if (!configuration) {
    return res.status(500).json({
      error: 'Invalid configuration data.'
    });
  }

  if (!sourcePath) {
    return res.status(400).json({
      error: 'Invalid route. Route must contain sourcePath',
    });
  }

  const index = configuration.routes.findIndex(r => r.sourcePath === sourcePath);
  if (index === -1) {
    return res.status(400).json({
      error: 'Invalid route. Route with sourcePath does not exist',
    });
  }

  route.sourcePath = sourcePath;
  configuration.routes[index] = route;
  db.setConfiguration(configuration);

  return res.json(route);
});

// @route DELETE /configuration/clients/:clientId
// @desc  Delete client
// @access By administrators IDs
router.delete("/clients/:clientId", (req, res, next) => {
  verifyAdmins(req, res, next, admins);
}, (req: Request, res: Response) => {
  const configuration = db.getConfiguration();
  const clientId = req.params.clientId;

  if (!configuration) {
    return res.status(500).json({
      error: 'Invalid configuration data.'
    });
  }

  if (!clientId) {
    return res.status(400).json({
      error: 'Invalid client. Client must contain clientId',
    });
  }

  const index = configuration.clients.findIndex(c => c.clientId === clientId);
  if (index === -1) {
    return res.status(400).json({
      error: 'Invalid client. Client with clientId does not exist',
    });
  }

  const client = configuration.clients[index];

  configuration.clients.splice(index, 1);
  db.setConfiguration(configuration);

  return res.json(client);
});

// @route DELETE /configuration/routes/:sourcePath
// @desc  Delete route
// @access By administrators IDs
router.delete("/routes/:sourcePath", (req, res, next) => {
  verifyAdmins(req, res, next, admins);
}, (req: Request, res: Response) => {
  const configuration = db.getConfiguration();
  const sourcePath = `/${req.params.sourcePath}`;

  if (!configuration) {
    return res.status(500).json({
      error: 'Invalid configuration data.'
    });
  }

  if (!sourcePath) {
    return res.status(400).json({
      error: 'Invalid route. Route must contain sourcePath',
    });
  }

  const index = configuration.routes.findIndex(r => r.sourcePath === sourcePath);
  if (index === -1) {
    return res.status(400).json({
      error: 'Invalid route. Route with sourcePath does not exist',
    });
  }

  const route = configuration.routes[index];

  configuration.routes.splice(index, 1);
  db.setConfiguration(configuration);

  return res.json(route);
});

export default router;
