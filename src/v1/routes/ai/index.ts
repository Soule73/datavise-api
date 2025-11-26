import { Router } from "express";
import generationsRouter from "./generations.routes";
import refinementsRouter from "./refinements.routes";
import analysisRouter from "./analysis.routes";
import conversationsRouter from "./conversations.routes";

const router = Router();

router.use("/generations", generationsRouter);
router.use("/refinements", refinementsRouter);
router.use("/analysis", analysisRouter);
router.use("/conversations", conversationsRouter);

export default router;
