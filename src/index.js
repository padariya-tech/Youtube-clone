// require('dotenv').config({path:'./env'})

import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'

dotenv.config({
    path:'./env'
})


// The remainder of the code sets up an Express server. It listens for any errors that occur in the app and logs them. It also starts the server and logs the port on which it is running.
connectDB()
.then(()=>{
    app.on("error",(error)=>{ 
            // if any error occured in app means express server connection
            console.log("Error ",error);
            throw error
        })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port :${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log('MONGO db connection failed !!',err);
})











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