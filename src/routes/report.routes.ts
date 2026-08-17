import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { getReportSummary } from "../controllers/report.controller";

const router = Router();

router.get(
  "/summary",
  authenticateToken,
  requireRole("ADMIN", "MANAGER", "OFFICER", "VIEWER"),
  getReportSummary
);

export default router;
