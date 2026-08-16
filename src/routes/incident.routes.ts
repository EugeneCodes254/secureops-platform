import { Router } from "express";
import {
  createIncident,
  getIncidents,
  getIncident,
  updateIncident,
  deleteIncident,
} from "../controllers/incident.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Health check
router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Incident routes are working ✅",
  });
});

// CRUD routes
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN", "MANAGER", "OFFICER"),
  createIncident
);

router.get(
  "/",
  authenticateToken,
  requireRole("ADMIN", "MANAGER", "OFFICER", "VIEWER"),
  getIncidents
);

router.get(
  "/:id",
  authenticateToken,
  requireRole("ADMIN", "MANAGER", "OFFICER", "VIEWER"),
  getIncident
);

router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN", "MANAGER", "OFFICER"),
  updateIncident
);

router.delete(
  "/:id",
  authenticateToken,
  requireRole("ADMIN", "MANAGER"),
  deleteIncident
);

export default router;
