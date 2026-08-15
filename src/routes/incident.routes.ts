import { Router } from "express";
import {
  createIncident,
  getIncidents,
  getIncident,
  updateIncident,
  deleteIncident,
} from "../controllers/incident.controller";

const router = Router();

// Health check
router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Incident routes are working ✅",
  });
});

// CRUD routes
router.post("/", createIncident);
router.get("/", getIncidents);
router.get("/:id", getIncident);
router.put("/:id", updateIncident);
router.delete("/:id", deleteIncident);

export default router;