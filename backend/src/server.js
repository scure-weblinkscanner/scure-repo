import express from 'express'
import cors from 'cors'
import userAccountRoutes from './routes/userAccount.routes.js'
import userProfileRoutes from './routes/userProfile.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/userAccount', userAccountRoutes)
app.use('/api/userProfile', userProfileRoutes)

app.listen(5000, () => {
  console.log('Server running on port 5000')
})

export default app