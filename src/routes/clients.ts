import { Router, Request, Response } from "express";
import axios from 'axios';
import * as db from '../db';
import { verifyClient } from "middleware";

const router = Router();

// @route GET /:path
// @desc  Route GET path
// @access By client IDs
router.get("/:path", verifyClient, async (req: Request, res: Response) => {
  const clientId = req.headers['client-id'] as string;
  const configuration = db.getConfiguration();
  const path = `/${req.params.path}`;
  const route = configuration.routes.find((route: Route) => route.sourcePath === path);

  if (!route) {
    return res.status(404).json({
      error: `Route ${path} not found`
    });
  }

  try {
    const response = await axios.get(route.destinationUrl, {
      headers: {
        'client-id': clientId
      }
    });

    res.location(route.destinationUrl);
    return res.status(302).json(response.data);
  } catch (error: any) {
    if (error.message.includes("404")) {
      return res.status(404).json({
        error: `Route ${path} destination not found`
      });
    }

    return res.status(500).json({
      error: error.message
    });
  }
});

// @route POST /:path
// @desc  Route POST path
// @access By client IDs
router.post("/:path", verifyClient, async (req: Request, res: Response) => {
  const clientId = req.headers['client-id'] as string;
  const configuration = db.getConfiguration();
  const path = `/${req.params.path}`;
  const route = configuration.routes.find((route: Route) => route.sourcePath === path);

  if (!route) {
    return res.status(404).json({
      error: `Route ${path} not found`
    });
  }

  try {
    const response = await axios.post(route.destinationUrl, req.body, {
      headers: {
        'client-id': clientId
      }
    });

    res.location(route.destinationUrl);
    return res.status(302).json(response.data);
  } catch (error: any) {
    if (error.message.includes("404")) {
      return res.status(404).json({
        error: `Route ${path} destination not found`
      });
    }

    return res.status(500).json({
      error: error.message
    });
  }
});

export default router;