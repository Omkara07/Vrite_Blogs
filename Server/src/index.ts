import express, { Request, Response } from 'express'
import cors from 'cors'
import mainRouter from './routes/index'
import { ConnectDB } from './db'
import axios from 'axios'
const app = express()
const PORT = 5000

// Middleware to set COOP headers
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin'); // Adjusting COOP
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none'); // Adjust as needed
    next();
});
const corsOptions = {
    origin: true, // Allow requests only from your Vercel app
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add other methods as needed
    credentials: true // If your API requires credentials (cookies, HTTP auth)
};
app.use(express.json())
app.use(cors(corsOptions))

ConnectDB();

app.use('/api/v1', mainRouter)


// app.listen(PORT, () => console.log("App is listening to " + PORT))

// Health check route for the self-call
app.get("/self-call", (req: Request, res: Response) => {
    console.log("Self-call received at", new Date().toISOString());
    res.status(200).send("Server is alive!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running`);

    // Set up a periodic self-call every 20 seconds
    const SELF_CALL_INTERVAL = 20 * 1000; // 20 seconds
    const SELF_URL = process.env.SERVER_URL || `http://localhost:${PORT}/self-call`;

    setInterval(async () => {
        try {
            console.log("Making self-call...");
            await axios.get(SELF_URL);
        } catch (error: any) {
            console.error("Error during self-call:", error.message);
        }
    }, SELF_CALL_INTERVAL);
});