import express from 'express'
import cors from 'cors'
import userAccountRoutes from './routes/userAccount.routes.js'
import userProfileRoutes from './routes/userProfile.routes.js'
import scanRoutes from './routes/scan.routes.js';

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/userAccount', userAccountRoutes)
app.use('/api/userProfile', userProfileRoutes)
app.use('/api/scanURL', scanRoutes);

// temporary route to list available models
app.get('/api/models', async (req, res) => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await response.json();
  res.json(data);
});

app.listen(5000, async () => {
  console.log('Server running on port 5000');
});

export default app