import { Router } from "express";

import {
  createPersonnel,
  getPersonnel,
  getSinglePersonnel,
  updatePersonnel,
  deletePersonnel,
} from "../controllers/personnel.controller";

import { authenticateToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Personnel routes are working",
  });
});

// View personnel
router.get(
  "/",
  authenticateToken,
  requireRole("ADMIN", "MANAGER", "OFFICER", "VIEWER"),
  getPersonnel
);

router.get(
  "/:id",
  authenticateToken,
  requireRole("ADMIN", "MANAGER", "OFFICER", "VIEWER"),
  getSinglePersonnel
);

// Manage personnel
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN", "MANAGER"),
  createPersonnel
);

router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN", "MANAGER"),
  updatePersonnel
);

router.delete(
  "/:id",
  authenticateToken,
  requireRole("ADMIN", "MANAGER"),
  deletePersonnel
);

export default router;
