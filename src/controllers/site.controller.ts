import { Request, Response } from "express";
import { PrismaClient, SiteStatus } from "@prisma/client";

const prisma = new PrismaClient();

// CREATE SITE
export const createSite = async (req: Request, res: Response) => {
  try {
    const { name, location, client, contact, status } = req.body;

    if (!name || !location || !client) {
      return res.status(400).json({
        success: false,
        message: "Site name, location and client are required.",
      });
    }

    const site = await prisma.site.create({
      data: {
        name,
        location,
        client,
        contact: contact || null,
        status: status || SiteStatus.ACTIVE,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Site created successfully",
      site,
    });
  } catch (error) {
    console.error("CREATE SITE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET ALL SITES
export const getSites = async (_req: Request, res: Response) => {
  try {
    const sites = await prisma.site.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      sites,
    });
  } catch (error) {
    console.error("GET SITES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET SINGLE SITE
export const getSingleSite = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid site ID",
      });
    }

    const site = await prisma.site.findUnique({
      where: { id },
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    return res.status(200).json({
      success: true,
      site,
    });
  } catch (error) {
    console.error("GET SITE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE SITE
export const updateSite = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid site ID",
      });
    }

    const { name, location, client, contact, status } = req.body;

    const site = await prisma.site.update({
      where: { id },
      data: {
        name,
        location,
        client,
        contact: contact || null,
        status: status as SiteStatus,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Site updated successfully",
      site,
    });
  } catch (error) {
    console.error("UPDATE SITE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE SITE
export const deleteSite = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid site ID",
      });
    }

    await prisma.site.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Site deleted successfully",
    });
  } catch (error) {
    console.error("DELETE SITE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
