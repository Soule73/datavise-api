/**
 * Agrégateur de routes v1
 */

import { Router } from "express";
import authRouter from "./auth.routes";
import widgetsRouter from "./widgets.routes";
import dashboardsRouter from "./dashboards.routes";
import dataSourcesRouter from "./data-sources.routes";
import aiRouter from "./ai";

const router = Router();

router.use("/auth", authRouter);
router.use("/widgets", widgetsRouter);
router.use("/dashboards", dashboardsRouter);
router.use("/data-sources", dataSourcesRouter);
router.use("/ai", aiRouter);

export default router;
