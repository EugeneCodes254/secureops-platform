import { PrismaClient, NotificationType, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

export const notifyUsersByRoles = async (
  roles: UserRole[],
  title: string,
  message: string,
  type: NotificationType = NotificationType.INFO
) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: roles,
        },
      },
      select: {
        id: true,
      },
    });

    if (users.length === 0) {
      return;
    }

    await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        title,
        message,
        type,
      })),
    });
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);
  }
};

export const notifyUser = async (
  userId: number,
  title: string,
  message: string,
  type: NotificationType = NotificationType.INFO
) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  } catch (error) {
    console.error("CREATE USER NOTIFICATION ERROR:", error);
  }
};
