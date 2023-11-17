const express = require('express')
const cors = require('cors')
const connectDB = require('./utils/connect_db');
const authRoutes = require('./routes/authRoutes')

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI

require('dotenv').config();

const app = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded( { extended: true } ))

// connectDB(MONGO_URI); --- get env file

// * important
// ! deprecated
// ? query
// todo


app.use('/api/auth/', authRoutes);

app.listen(PORT,()=>{ 
     console.log(`Server started at PORT ${PORT}`)
})