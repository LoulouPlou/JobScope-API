import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import config from "config";

const app: Application = express();

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

export default app;