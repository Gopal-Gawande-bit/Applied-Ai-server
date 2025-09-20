import commentService from "../services/comment-services.js"
import TaskModel from "../models/task-model.js"
import UserModel from "../models/user-model.js"

class CommentController {
  async createComment(req, res) {
    try {
      const { content, taskId } = req.body

      // Grab userId from token
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      // Validate required fields
      if (!content || !taskId) {
        return res.status(400).json({
          message: "Content and taskId are required fields",
        })
      }

      // Check if task exists
      const taskExists = await TaskModel.exists({ _id: taskId })
      if (!taskExists) {
        return res.status(404).json({ message: "Task not found" })
      }

      // Create comment
      const newComment = await commentService.createComment({
        content,
        taskId,
        userId,
      })

      res.status(201).json(newComment)
    } catch (error) {
      console.error(error)
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async getAllComments(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        taskId,
        userId,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query

      const filters = {
        page,
        limit,
        search,
        taskId,
        userId,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      }

      const result = await commentService.getAllComments(filters)

      res.status(200).json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async getCommentById(req, res) {
    const { commentId } = req.params

    try {
      const comment = await commentService.getCommentById(commentId)
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" })
      }
      res.status(200).json(comment)
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async updateComment(req, res) {
    const { commentId } = req.params
    const updateData = req.body

    try {
      if (updateData.taskId) {
        const taskExists = await TaskModel.exists({ _id: updateData.taskId })
        if (!taskExists) {
          return res.status(404).json({ message: "Task not found" })
        }
      }

      if (updateData.userId) {
        const userExists = await UserModel.exists({ _id: updateData.userId })
        if (!userExists) {
          return res.status(404).json({ message: "User not found" })
        }
      }

      const updatedComment = await commentService.updateCommentById(
        commentId,
        updateData
      )
      if (!updatedComment) {
        return res.status(404).json({ message: "Comment not found" })
      }
      res.status(200).json(updatedComment)
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async deleteComment(req, res) {
    const { commentId } = req.params

    try {
      const deletedComment = await commentService.deleteCommentById(commentId)
      if (!deletedComment) {
        return res.status(404).json({ message: "Comment not found" })
      }
      res.status(200).json({ message: "Comment deleted successfully" })
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }
}

export default new CommentController()
