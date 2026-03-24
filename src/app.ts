import { toNodeHandler } from "better-auth/node";
import express, { Application, Request, Response } from "express";
import { auth } from "./app/lib/auth";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import path from "path";
import qs from "qs";

const app: Application = express();

app.set("query parser", (str: string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.use("/api/auth", toNodeHandler(auth));

// Enable URL-encoded form data parsing

// Middleware to parse JSON bodies

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", IndexRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Express!");
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;