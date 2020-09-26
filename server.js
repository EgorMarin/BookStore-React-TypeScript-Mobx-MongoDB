const express = require('express')
const userRoutes = require('./routes/user.routes')
const productRoutes = require('./routes/product.routes')
const orderRoutes = require('./routes/order.routes.js')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const app = express()

const PORT = 5000
dotenv.config()

app.use(cors())
app.use(express.json())
app.use('/api/user', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

mongoose.connect(process.env.DB_CONNECT, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})

app.listen(PORT, () => {
  console.log(`Server was started on port ${PORT}`)
})