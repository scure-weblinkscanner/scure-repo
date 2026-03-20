import express from 'express'
import cors from 'cors'
import userAccountRoutes from './routes/userAccount.routes.js'
import userProfileRoutes from './routes/userProfile.routes.js'
import scanRoutes from './routes/scan.routes.js';
import ticketsRoutes from './routes/tickets.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/userAccount', userAccountRoutes)
app.use('/api/userProfile', userProfileRoutes)
app.use('/api/scanURL', scanRoutes);
app.use('/api/tickets', ticketsRoutes)


app.get('/api/test', (req, res) => {
  res.json({ message: 'test works' })
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`);
});

export default app