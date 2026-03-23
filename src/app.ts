import { toNodeHandler } from "better-auth/node";
import express, { Application } from "express";
import { auth } from "./app/lib/auth";


const app: Application = express();

app.use("/api/auth", toNodeHandler(auth));

// Enable URL-encoded form data parsing

// Middleware to parse JSON bodies

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/api/v1", IndexRoutes);

// Basic route
// app.get('/', async (req: Request, res: Response) => {

//     const roomCategorys = await prisma.specialty.create({
//         data: {
//             title: 'Cardiology'
//         }
//     })
//     res.status(201).json({
//         success: true,
//         message: 'API is working',
//     })
// });

export default app;