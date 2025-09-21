import taskService from "../services/task-service.js"
import ProjectModel from "../models/project-model.js"
import UserModel from "../models/user-model.js"

class TaskController {
  async createTask(req, res) {
    try {
      const {
        title,
        description,
        status,
        priority,
        dueDate,
        project,
        assignTo,
      } = req.body

      // Grab createdBy from token
      const createdBy = req.user?.userId
      if (!createdBy) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      // Validate required fields
      if (!title || !description || !project) {
        return res.status(400).json({
          message: "Title, description, and project are required fields",
        })
      }

      // Check if project exists
      const projectExists = await ProjectModel.exists({ _id: project })
      if (!projectExists) {
        return res.status(404).json({ message: "Project not found" })
      }

      // Check if assigned user exists
      if (assignTo) {
        const assignToExists = await UserModel.exists({ _id: assignTo })
        if (!assignToExists) {
          return res.status(404).json({ message: "Assigned user not found" })
        }
      }

      // Create task
      const newTask = await taskService.createTask({
        title,
        description,
        status: status || "pending",
        priority: priority || "medium",
        dueDate,
        project,
        createdBy,
        assignTo,
      })

      res.status(201).json(newTask)
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message })
    }
  }

  async getAllTasks(req, res) {
    try {
      const { assignTo, createdBy, project, status, priority, dueDate } =
        req.query

      const filters = {
        assignTo,
        createdBy,
        project,
        status,
        priority,
        dueDate,
      }

      const tasks = await taskService.getAllTasks(filters)

      res.status(200).json(tasks)
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async getTaskById(req, res) {
    const { taskId } = req.params

    try {
      const task = await taskService.getTaskById(taskId)
      if (!task) {
        return res.status(404).json({ message: "Task not found" })
      }
      res.status(200).json(task)
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async getTasksByProject(req, res) {
    try {
      const { projectId } = req.params
      const {
        page = 1,
        limit = 10,
        search = "",
        status,
        priority,
        assignTo,
        dueDate,
        sortBy = "orderNo",
        sortOrder = "asc",
      } = req.query

      const filters = {
        page,
        limit,
        search,
        status,
        priority,
        assignTo,
        dueDate,
        sortBy,
        sortOrder,
      }

      const result = await taskService.getTasksByProject(projectId, filters)
      res.status(200).json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async updateTask(req, res) {
    const { taskId } = req.params
    const updateData = req.body

    // Optional validation for enum fields if provided
    if (
      updateData.status &&
      !["pending", "inprogress", "inreview", "done"].includes(updateData.status)
    ) {
      return res.status(400).json({ message: "Invalid status value" })
    }
    if (
      updateData.priority &&
      !["low", "medium", "high"].includes(updateData.priority)
    ) {
      return res.status(400).json({ message: "Invalid priority value" })
    }

    // Additional checks if updating project or users
    if (updateData.project) {
      const projectExists = await ProjectModel.exists({
        _id: updateData.project,
      })
      if (!projectExists) {
        return res.status(404).json({ message: "Project not found" })
      }
    }

    if (updateData.createdBy) {
      const createdByExists = await UserModel.exists({
        _id: updateData.createdBy,
      })
      if (!createdByExists) {
        return res.status(404).json({ message: "CreatedBy user not found" })
      }
    }

    if (updateData.assignTo) {
      const assignToExists = await UserModel.exists({
        _id: updateData.assignTo,
      })
      if (!assignToExists) {
        return res.status(404).json({ message: "AssignedTo user not found" })
      }
    }

    try {
      const updatedTask = await taskService.updateTaskById(taskId, updateData)
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" })
      }
      res.status(200).json(updatedTask)
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async deleteTask(req, res) {
    const { taskId } = req.params

    try {
      const deletedTask = await taskService.deleteTaskById(taskId)
      if (!deletedTask) {
        return res.status(404).json({ message: "Task not found" })
      }
      res.status(200).json({ message: "Task deleted successfully" })
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }
}

export default new TaskController()
