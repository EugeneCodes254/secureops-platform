import { Router } from "express";

import {
  createSite,
  getSites,
  getSingleSite,
  updateSite,
  deleteSite,
} from "../controllers/site.controller";

import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Site routes are working",
  });
});

// View sites
router.get(
  "/",
  authenticateToken,
  requireRole("ADMIN", "MANAGER", "OFFICER", "VIEWER"),
  getSites
);

router.get(
  "/:id",
  authenticateToken,
  requireRole("ADMIN", "MANAGER", "OFFICER", "VIEWER"),
  getSingleSite
);

// Manage sites
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN", "MANAGER"),
  createSite
);

router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN", "MANAGER"),
  updateSite
);

router.delete(
  "/:id",
  authenticateToken,
  requireRole("ADMIN", "MANAGER"),
  deleteSite
);

export default router;
