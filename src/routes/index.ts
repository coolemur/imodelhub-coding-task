import { Router } from "express";
import configuration from "./configuration";
import clients from "./clients";

const router = Router();

router.use("/configuration", configuration);
router.use("/", clients);

export default router;
