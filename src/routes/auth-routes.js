import express from "express"
const router = express.Router()
import authController from "../controllers/auth-controller.js"

router.post("/user/register", authController.register)
router.post("/user/login", authController.login)

export default router
