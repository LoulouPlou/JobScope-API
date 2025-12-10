import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import config from "config";
import jobscopeRoutes from "./routes/jobscope.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// CORS
const corsOptions = config.get<CorsOptions>("security.cors");
app.use(cors(corsOptions));

// Default Route
app.get("/", (_req, res) => {
    res.send("Welcome to the JobScope API");
});

app.use("/api", jobscopeRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;