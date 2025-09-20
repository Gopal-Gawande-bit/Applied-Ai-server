import express from "express"
import cors from "cors"
import morgan from "morgan"
import connectDB from "./src/config/database.js"
import authRoutes from "./src/routes/auth-routes.js"

const app = express()

app.use(morgan("dev"))
app.use(cors())
app.use(express.json())

connectDB()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/v1/auth", authRoutes)

export default app
