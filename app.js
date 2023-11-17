const express = require('express')
const cors = require('cors')
const connectDB = require('./utils/connect_db');
const authRoutes = require('./routes/authRoutes')

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL


const app = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded( { extended: true } ))

connectDB(DB_URL);

// * important
// ! deprecated
// ? query
// todo


app.use('/api/auth/', authRoutes);

app.listen(PORT,()=>{ 
     console.log(`Server started at PORT ${PORT}`)
})