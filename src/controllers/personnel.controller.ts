import { Request, Response } from "express";
import { PrismaClient, PersonnelStatus } from "@prisma/client";
import { notifyUsersByRoles } from "../services/notification.service";

const prisma = new PrismaClient();

// CREATE PERSONNEL
export const createPersonnel = async (req: Request, res: Response) => {
  try {
    const { fullName, role, phone, site, status } = req.body;

    if (!fullName || !role || !phone || !site) {
      return res.status(400).json({
        success: false,
        message: "Full name, role, phone and site are required.",
      });
    }

    const personnel = await prisma.personnel.create({
      data: {
        fullName,
        role,
        phone,
        site,
        status: status || PersonnelStatus.ACTIVE,
      },
    });

    await notifyUsersByRoles(
      ["ADMIN", "MANAGER"],
      "Personnel Added",
      `${personnel.fullName} has been added to the security personnel roster.`,
      "INFO"
    );

    return res.status(201).json({
      success: true,
      message: "Personnel created successfully",
      personnel,
    });
  } catch (error) {
    console.error("CREATE PERSONNEL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET ALL PERSONNEL
export const getPersonnel = async (_req: Request, res: Response) => {
  try {
    const personnel = await prisma.personnel.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      personnel,
    });
  } catch (error) {
    console.error("GET PERSONNEL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET SINGLE PERSONNEL
export const getSinglePersonnel = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const personnel = await prisma.personnel.findUnique({
      where: { id },
    });

    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: "Personnel not found",
      });
    }

    return res.status(200).json({
      success: true,
      personnel,
    });
  } catch (error) {
    console.error("GET PERSONNEL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE PERSONNEL
export const updatePersonnel = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const { fullName, role, phone, site, status } = req.body;

    const personnel = await prisma.personnel.update({
      where: { id },
      data: {
        fullName,
        role,
        phone,
        site,
        status,
      },
    });

    await notifyUsersByRoles(
      ["ADMIN", "MANAGER"],
      "Personnel Updated",
      `${personnel.fullName}'s personnel record has been updated.`,
      "INFO"
    );

    return res.status(200).json({
      success: true,
      message: "Personnel updated successfully",
      personnel,
    });
  } catch (error) {
    console.error("UPDATE PERSONNEL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE PERSONNEL
export const deletePersonnel = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const personnel = await prisma.personnel.findUnique({
      where: { id },
    });

    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: "Personnel not found",
      });
    }

    await prisma.personnel.delete({
      where: { id },
    });

    await notifyUsersByRoles(
      ["ADMIN", "MANAGER"],
      "Personnel Removed",
      `${personnel.fullName} has been removed from the security personnel roster.`,
      "WARNING"
    );

    return res.status(200).json({
      success: true,
      message: "Personnel deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PERSONNEL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
