import express from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import config from "config";
import jobRoutes from "./routes/job.routes";

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());

// CORS
const corsOptions = config.get<CorsOptions>("security.cors");
app.use(cors(corsOptions));

// Default Route
app.get("/", (_req, res) => {
    res.send("Welcome to the JobScope API");
});

app.use("/api/jobs", jobRoutes);


export default app;