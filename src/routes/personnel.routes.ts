import { Router } from "express";

import {
  createPersonnel,
  getPersonnel,
  getSinglePersonnel,
  updatePersonnel,
  deletePersonnel,
} from "../controllers/personnel.controller";

const router = Router();

router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Personnel routes are working",
  });
});

router.post("/", createPersonnel);
router.get("/", getPersonnel);
router.get("/:id", getSinglePersonnel);
router.put("/:id", updatePersonnel);
router.delete("/:id", deletePersonnel);

export default router;
