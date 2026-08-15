import { Request, Response } from "express";
import { PrismaClient, Severity, Status } from "@prisma/client";

const prisma = new PrismaClient();

// ==============================
// CREATE INCIDENT
// ==============================
export const createIncident = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      severity,
      personnelId,
    } = req.body;

    if (!title || !description || !severity) {
      return res.status(400).json({
        success: false,
        message: "Title, description and severity are required.",
      });
    }

    // Validate severity
    if (!Object.values(Severity).includes(severity)) {
      return res.status(400).json({
        success: false,
        message: "Invalid severity value.",
      });
    }

    // If an officer was supplied, make sure they exist
    if (personnelId !== undefined && personnelId !== null) {
      const personnel = await prisma.personnel.findUnique({
        where: {
          id: Number(personnelId),
        },
      });

      if (!personnel) {
        return res.status(404).json({
          success: false,
          message: "Assigned personnel not found.",
        });
      }
    }

    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        severity: severity as Severity,
        personnelId:
          personnelId !== undefined && personnelId !== null
            ? Number(personnelId)
            : null,
      },
      include: {
        personnel: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Incident created successfully",
      incident,
    });
  } catch (error) {
    console.error("CREATE INCIDENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==============================
// GET ALL INCIDENTS
// ==============================
export const getIncidents = async (_req: Request, res: Response) => {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        personnel: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      incidents,
    });
  } catch (error) {
    console.error("GET INCIDENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==============================
// GET SINGLE INCIDENT
// ==============================
export const getIncident = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident ID.",
      });
    }

    const incident = await prisma.incident.findUnique({
      where: {
        id,
      },
      include: {
        personnel: true,
      },
    });

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    return res.status(200).json({
      success: true,
      incident,
    });
  } catch (error) {
    console.error("GET INCIDENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==============================
// UPDATE INCIDENT
// ==============================
export const updateIncident = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident ID.",
      });
    }

    const {
      title,
      description,
      severity,
      status,
      personnelId,
    } = req.body;

    // Check incident exists
    const existingIncident = await prisma.incident.findUnique({
      where: {
        id,
      },
    });

    if (!existingIncident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found.",
      });
    }

    // Validate severity if supplied
    if (
      severity !== undefined &&
      !Object.values(Severity).includes(severity)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid severity value.",
      });
    }

    // Validate status if supplied
    if (
      status !== undefined &&
      !Object.values(Status).includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    // Validate assigned personnel
    if (personnelId !== undefined && personnelId !== null) {
      const personnel = await prisma.personnel.findUnique({
        where: {
          id: Number(personnelId),
        },
      });

      if (!personnel) {
        return res.status(404).json({
          success: false,
          message: "Assigned personnel not found.",
        });
      }
    }

    const incident = await prisma.incident.update({
      where: {
        id,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(severity !== undefined && {
          severity: severity as Severity,
        }),
        ...(status !== undefined && {
          status: status as Status,
        }),
        ...(personnelId !== undefined && {
          personnelId:
            personnelId === null
              ? null
              : Number(personnelId),
        }),
      },
      include: {
        personnel: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Incident updated successfully",
      incident,
    });
  } catch (error) {
    console.error("UPDATE INCIDENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==============================
// DELETE INCIDENT
// ==============================
export const deleteIncident = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident ID.",
      });
    }

    const existingIncident = await prisma.incident.findUnique({
      where: {
        id,
      },
    });

    if (!existingIncident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found.",
      });
    }

    await prisma.incident.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Incident deleted successfully",
    });
  } catch (error) {
    console.error("DELETE INCIDENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};