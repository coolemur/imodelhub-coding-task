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

export default router;
