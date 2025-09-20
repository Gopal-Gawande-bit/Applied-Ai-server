import express from "express"
import projectController from "../controllers/project-controller.js"
import userController from "../controllers/user-controller.js"
import taskController from "../controllers/task-controller.js"

const router = express.Router()

// User Routes- /api/v1/projects
router.post("/projects", projectController.createProject)
router.get("/projects", projectController.getProjects)
router.get("/projects/:projectId", projectController.getProjectById)
router.patch("/projects/:projectId", userController.updateUser)
router.delete("/projects/:projectId", userController.deleteUser)
router.post("/projects/:projectId/members", projectController.addMember)
router.delete("/projects/:projectId/members", projectController.removeMember)

// User Routes- /api/v1/users
router.get("/users", userController.getAllUsers)
router.get("/users/:userId", userController.getUserById)
router.patch("/users/:userId", userController.updateUser)
router.delete("/users/:userId", userController.deleteUser)

// Task Routes - /api/v1/tasks
router.post("/tasks", taskController.createTask)
router.get("/tasks", taskController.getAllTasks)
router.get("/tasks/:taskId", taskController.getTaskById)
router.get("/tasks/project/:projectId", taskController.getTasksByProject)
router.patch("/tasks/:taskId", taskController.updateTask)
router.delete("/tasks/:taskId", taskController.deleteTask)

export default router
