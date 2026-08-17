import { Request, Response } from "express";
import { PrismaClient, Severity, Status, PersonnelStatus, SiteStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const getReportSummary = async (_req: Request, res: Response) => {
  try {
    const [
      totalIncidents,
      openIncidents,
      inProgressIncidents,
      resolvedIncidents,
      closedIncidents,
      criticalIncidents,
      highIncidents,
      mediumIncidents,
      lowIncidents,
      totalPersonnel,
      activePersonnel,
      offDutyPersonnel,
      suspendedPersonnel,
      totalSites,
      activeSites,
      maintenanceSites,
      inactiveSites,
      recentIncidents,
    ] = await Promise.all([
      prisma.incident.count(),
      prisma.incident.count({ where: { status: Status.OPEN } }),
      prisma.incident.count({ where: { status: Status.IN_PROGRESS } }),
      prisma.incident.count({ where: { status: Status.RESOLVED } }),
      prisma.incident.count({ where: { status: Status.CLOSED } }),

      prisma.incident.count({ where: { severity: Severity.CRITICAL } }),
      prisma.incident.count({ where: { severity: Severity.HIGH } }),
      prisma.incident.count({ where: { severity: Severity.MEDIUM } }),
      prisma.incident.count({ where: { severity: Severity.LOW } }),

      prisma.personnel.count(),
      prisma.personnel.count({ where: { status: PersonnelStatus.ACTIVE } }),
      prisma.personnel.count({ where: { status: PersonnelStatus.OFF_DUTY } }),
      prisma.personnel.count({ where: { status: PersonnelStatus.SUSPENDED } }),

      prisma.site.count(),
      prisma.site.count({ where: { status: SiteStatus.ACTIVE } }),
      prisma.site.count({ where: { status: SiteStatus.MAINTENANCE } }),
      prisma.site.count({ where: { status: SiteStatus.INACTIVE } }),

      prisma.incident.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { personnel: true },
      }),
    ]);

    return res.json({
      success: true,

      incidents: {
        total: totalIncidents,
        status: {
          open: openIncidents,
          inProgress: inProgressIncidents,
          resolved: resolvedIncidents,
          closed: closedIncidents,
        },
        severity: {
          critical: criticalIncidents,
          high: highIncidents,
          medium: mediumIncidents,
          low: lowIncidents,
        },
      },

      personnel: {
        total: totalPersonnel,
        active: activePersonnel,
        offDuty: offDutyPersonnel,
        suspended: suspendedPersonnel,
      },

      sites: {
        total: totalSites,
        active: activeSites,
        maintenance: maintenanceSites,
        inactive: inactiveSites,
      },

      recentIncidents,
    });
  } catch (error) {
    console.error("REPORT SUMMARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate operational report.",
    });
  }
};
