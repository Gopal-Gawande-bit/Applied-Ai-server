import TaskModel from "../models/task-model.js"
import ProjectModel from "../models/project-model.js"
import UserModel from "../models/user-model.js" // Assuming User model exists as referenced in schemas

class TaskService {
  async createTask(taskData) {
    const task = new TaskModel(taskData)
    return task.save()
  }

  async getAllTasks({
    assignTo,
    createdBy,
    project,
    status,
    priority,
    dueDate,
  }) {
    try {
      const query = {}

      if (assignTo) query.assignTo = assignTo
      if (createdBy) query.createdBy = createdBy
      if (project) query.project = project
      if (status) query.status = status
      if (priority) query.priority = priority

      if (dueDate) {
        // Example: get tasks due on or before the given date
        query.dueDate = { $lte: new Date(dueDate) }
      }

      return await TaskModel.find(query)
        .populate("project", "name")
        .populate("createdBy", "name email")
        .populate("assignTo", "name email")
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async getTaskById(taskId) {
    try {
      return await TaskModel.findById(taskId)
        .populate("project", "name")
        .populate("createdBy", "name email")
        .populate("assignTo", "name email")
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async getTasksByProject(
    projectId,
    {
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
  ) {
    // Check if project exists
    const projectExists = await ProjectModel.exists({ _id: projectId })
    if (!projectExists) {
      throw new Error("Project not found")
    }

    const query = { project: projectId }

    // Filters
    if (status) query.status = status
    if (priority) query.priority = priority
    if (assignTo) query.assignTo = assignTo
    if (dueDate) query.dueDate = { $eq: new Date(dueDate) }

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Sorting
    const sortOption = {}
    sortOption[sortBy] = sortOrder === "desc" ? -1 : 1

    const tasks = await TaskModel.find(query)
      .populate("project", "name")
      .populate("createdBy", "name email")
      .populate("assignTo", "name email")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await TaskModel.countDocuments(query)

    return {
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    }
  }

  async updateTaskById(taskId, data) {
    try {
      return await TaskModel.findByIdAndUpdate(taskId, data, {
        new: true,
      })
        .populate("project", "name")
        .populate("createdBy", "name email")
        .populate("assignTo", "name email")
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async deleteTaskById(taskId) {
    try {
      return await TaskModel.findByIdAndDelete(taskId)
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

export default new TaskService()
