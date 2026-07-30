import express from "express";
import { runStatusUpdate } from "../controllers/scheduler.controller.js";
import { verifySchedulerSecret } from "../middleware/verifyScheduler.js";

const router = express.Router();

router.post('/run-status-update', verifySchedulerSecret, runStatusUpdate);

export default router;