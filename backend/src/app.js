import cors from 'cors';
import express from 'express';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ success: true, message: 'Teen Expense Tracker API is running.' });
});

export default app;
