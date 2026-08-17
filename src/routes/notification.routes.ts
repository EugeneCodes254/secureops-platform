import { Router } from "express";

import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../controllers/notification.controller";

import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Get all notifications
router.get(
  "/",
  authenticateToken,
  getNotifications
);

// Get unread notification count
router.get(
  "/unread-count",
  authenticateToken,
  getUnreadCount
);

// Mark all notifications as read
router.put(
  "/read-all",
  authenticateToken,
  markAllNotificationsRead
);

// Mark one notification as read
router.put(
  "/:id/read",
  authenticateToken,
  markNotificationRead
);

// Delete one notification
router.delete(
  "/:id",
  authenticateToken,
  deleteNotification
);

export default router;
