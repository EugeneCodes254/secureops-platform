import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    email: string;
    role: "ADMIN" | "MANAGER" | "OFFICER" | "VIEWER";
  };
};

// GET ALL NOTIFICATIONS
export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load notifications.",
    });
  }
};

// GET UNREAD COUNT
export const getUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const count = await prisma.notification.count({
      where: {
        userId: req.user.id,
        read: false,
      },
    });

    return res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("GET UNREAD COUNT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load unread notification count.",
    });
  }
};

// MARK ONE AS READ
export const markNotificationRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    const updated = await prisma.notification.update({
      where: {
        id,
      },
      data: {
        read: true,
      },
    });

    return res.json({
      success: true,
      message: "Notification marked as read.",
      notification: updated,
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to mark notification as read.",
    });
  }
};

// MARK ALL AS READ
export const markAllNotificationsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return res.json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to mark notifications as read.",
    });
  }
};

// DELETE ONE NOTIFICATION
export const deleteNotification = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    await prisma.notification.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete notification.",
    });
  }
};
