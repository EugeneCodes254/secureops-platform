import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import incidentRoutes from "./routes/incident.routes";
import siteRoutes from "./routes/site.routes";
import personnelRoutes from "./routes/personnel.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/incidents", incidentRoutes);
app.use("/sites", siteRoutes);
app.use("/personnel", personnelRoutes);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "🚀 SecureOps Backend Running",
  });
});

export default app;
