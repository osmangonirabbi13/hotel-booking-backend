import { toNodeHandler } from "better-auth/node";
import express, { Application } from "express";
import { auth } from "./app/lib/auth";
import { IndexRoutes } from "./app/routes";


const app: Application = express();

app.use("/api/auth", toNodeHandler(auth));

// Enable URL-encoded form data parsing

// Middleware to parse JSON bodies

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", IndexRoutes);



export default app;