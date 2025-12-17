import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import config from "config";

import jobscopeRoutes from "./routes/jobscope.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
//Swagger JSON
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../docs/swagger.jobscope.json";


const app: Application = express();

//MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

//CORS
const corsOptions = config.get<CorsOptions>("security.cors");
app.use(cors(corsOptions));

//ROOT / HEALTH CHECK
app.get("/", (req: Request, res: Response) => {
    const host = req.get("host");
    const protocol = req.protocol;

    res.json({
        name: "JobScope API",
        version: "1.0.0",
        description: "REST API for IT job market analysis in Canada",
        documentation: {
            swagger: `${protocol}://${host}/docs`,
        },
    });
});

//API ROUTES
app.use("/api", jobscopeRoutes);

//SWAGGER
app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

// 404 + ERROR HANDLING
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
