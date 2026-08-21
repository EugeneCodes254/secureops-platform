import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import incidentRoutes from "./routes/incident.routes";
import siteRoutes from "./routes/site.routes";
import personnelRoutes from "./routes/personnel.routes";
import notificationRoutes from "./routes/notification.routes";
import reportRoutes from "./routes/report.routes";
import demoAdminRoutes from "./routes/demo-admin.routes";
import { authenticateToken } from "./middleware/auth.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/incidents", authenticateToken, incidentRoutes);
app.use("/sites", authenticateToken, siteRoutes);
app.use("/personnel", authenticateToken, personnelRoutes);
app.use("/notifications", notificationRoutes);
app.use("/reports", reportRoutes);
app.use("/demo-admin", demoAdminRoutes);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "🚀 SecureOps Backend Running",
  });
});

export default app;
