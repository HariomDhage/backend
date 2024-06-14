import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}) )

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// import routers

import userRouter from "./routes/user.routes.js";

//Routes declaration
app.use("/api/v1/users",userRouter)

//http://localhost:8000/api/v1/users/register
//app.use("/users". userRouter)
//http://localhost:8000/users/register  -it will look like this.

export { app }