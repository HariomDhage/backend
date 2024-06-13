//require('dotenv').config({path: './env'});
// use dotenv to load all enviroment variable as early as possible
import dotenv from "dotenv";
import mongoose, { Mongoose } from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB()
.then(process.env.PORT || 8000,() => {
console.log(`server is running at port : $
  {process.env.PORT}`);
})
.catch((err) => {
console.log("Mongo db connection failed !!!")
})




/*
import { express } from "express"
const app = express()
(async () => {
    try {
      await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      app.on("error", (error) =>{
        console.log("ERROR: ", error);
        throw error

      })

      app.listen(process.env.PORT, () => {
        console.log(`App is listening on port ${pocess.env.PORT}`);
      })
    }
    catch (error) {
        console.error("ERROR: ", error)
            throw err

    }
})()
    */
