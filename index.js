const express = require('express')
const cors = require('cors')

const app = express()

//CONF JSON
app.use(express.json())

//CORS
app.use(cors({ credentials:true, origin: 'http://localhost:3000'}))


// PUBLIC IMG
app.use(express.static('public'))

// ROTAS 
const UserRoutes = require('./routes/UserRoutes')
const ProductRoutes = require('./routes/ProductRoutes')

app.use('/users', UserRoutes)

app.use('/product', ProductRoutes)

app.listen(5000)