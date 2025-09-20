import express from "express"
import cors from "cors"
import morgan from "morgan"
import connectDB from "./src/config/database.js"
import authRoutes from "./src/routes/auth-routes.js"
import routes from "./src/routes/routes.js"
import TokenService from "./src/services/token-service.js"

const app = express()

app.use(morgan("dev"))
app.use(cors())
app.use(express.json())

connectDB()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1", TokenService.authenticateToken, routes)

export default app
