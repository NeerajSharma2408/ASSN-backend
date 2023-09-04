const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())

// MAKE A ROUTER AND CODE
app.get('/', (req,res)=>{
    console.log("APP IS RUNNING")
    res.status(200).json({"MESSAGE": "GET ROUTE WORKING"});
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, (err)=>{
    if(err){
        console.log(err)
    }else{
        console.log("APP STARTED AT PORT ", PORT)
    }
})