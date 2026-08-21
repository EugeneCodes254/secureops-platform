import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/promote", async (req, res) => {
  try {
    if (req.headers["x-demo-secret"] !== "SECUREOPS-DEMO-2026") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const user = await prisma.user.update({
      where: {
        email: "demo@secureops.com",
      },
      data: {
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return res.json({
      success: true,
      message: "Demo account promoted",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not promote demo account",
    });
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
