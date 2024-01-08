// require('dotenv').config({path:'./env'})

import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})

connectDB()













// import express from "express";
// const app = express();

// // always getting data from db use async and await
// // below function will connect to db and also calling that function also

// ;(async()=>{ // this is called iffy
//     try{
// await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
// app.on("error",(error)=>{ 
//     // if any error occured in app means express server connection
//     console.log("Error ",error);
//     throw error
// })

// app.listen(process.env.PORT,()=>console.log(`App is listening on port ${process.env.PORT}`));
//     }
//     catch(error){
//         console.log("Error: ",error)
//     }
// })()