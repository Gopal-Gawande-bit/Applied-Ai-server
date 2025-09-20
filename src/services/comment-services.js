import CommentModel from "../models/comment-model.js"
import TaskModel from "../models/task-model.js"
import UserModel from "../models/user-model.js"

class CommentService {
  async createComment(commentData) {
    const comment = new CommentModel(commentData)
    return comment.save()
  }

  async getAllComments({
    page,
    limit,
    search,
    taskId,
    userId,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  }) {
    const query = {}

    // Filters
    if (taskId) query.taskId = taskId
    if (userId) query.userId = userId
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    // Search
    if (search) {
      query.content = { $regex: search, $options: "i" }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Sorting
    const sortOption = {}
    sortOption[sortBy] = sortOrder === "asc" ? 1 : -1

    const comments = await CommentModel.find(query)
      .populate("taskId", "title")
      .populate("userId", "name email")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await CommentModel.countDocuments(query)

    return {
      data: comments,
      totalCount: total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    }
  }

  async getCommentById(commentId) {
    try {
      return await CommentModel.findById(commentId)
        .populate("taskId", "title")
        .populate("userId", "name email")
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async updateCommentById(commentId, data) {
    try {
      return await CommentModel.findByIdAndUpdate(commentId, data, {
        new: true,
      })
        .populate("taskId", "title")
        .populate("userId", "name email")
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async deleteCommentById(commentId) {
    try {
      return await CommentModel.findByIdAndDelete(commentId)
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

export default new CommentService()
