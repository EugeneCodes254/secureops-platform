import { Router } from "express";

import {
  createSite,
  getSites,
  getSingleSite,
  updateSite,
  deleteSite,
} from "../controllers/site.controller";

const router = Router();

router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Site routes are working",
  });
});

router.post("/", createSite);
router.get("/", getSites);
router.get("/:id", getSingleSite);
router.put("/:id", updateSite);
router.delete("/:id", deleteSite);

export default router;
