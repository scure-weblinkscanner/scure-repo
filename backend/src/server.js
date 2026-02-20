import express from 'express'
import cors from 'cors'
import userAccountRoutes from './routes/userAccount.routes.js'
import userProfileRoutes from './routes/userProfile.routes.js'
import scanURLRoutes from './routes/scanURL.routes.js';
import { initOCR } from './utils/ocrService.js';

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/userAccount', userAccountRoutes)
app.use('/api/userProfile', userProfileRoutes)
app.use('/api/scanURL', scanURLRoutes);

// after app.listen
app.listen(5000, async () => {
  console.log('Server running on port 5000');
  await initOCR();
});

export default app