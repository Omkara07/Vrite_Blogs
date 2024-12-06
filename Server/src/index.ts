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

// Prewarm Route
app.get('/prewarm', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Prewarm successful' });
});
app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);

    // Prewarm the server
    const backendURL = process.env.SERVER_URL || `http://localhost:${PORT}`;
    axios
        .get(`${backendURL}/prewarm`)
        .then((response) => {
            console.log('Prewarm successful:', response.status, response.data);
        })
        .catch((error) => {
            console.error('Error during prewarm:', error.message);
        });
});