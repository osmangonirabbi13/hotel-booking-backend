import express, { Application, Request, Response } from "express";


const app: Application = express();


// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// app.use("/api/v1", IndexRoutes);

// Basic route
app.get('/', async (req: Request, res: Response) => {

    const roomCategorys = await prisma.specialty.create({
        data: {
            title: 'Cardiology'
        }
    })
    res.status(201).json({
        success: true,
        message: 'API is working',
    })
});

export default app;