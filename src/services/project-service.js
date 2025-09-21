import ProjectModel from "../models/project-model.js"
import UserModel from "../models/user-model.js"

class ProjectService {
  async createProject(projectData) {
    const { members } = projectData

    // Validate member IDs
    if (members && members.length > 0) {
      const existingUsers = await UserModel.find({
        _id: { $in: members },
      }).select("_id")
      const existingUserIds = existingUsers.map((user) => user._id.toString())

      // Check if any member does not exist
      const invalidMembers = members.filter(
        (id) => !existingUserIds.includes(id)
      )
      if (invalidMembers.length > 0) {
        throw new Error(`Invalid member IDs: ${invalidMembers.join(", ")}`)
      }
    }

    const project = new ProjectModel(projectData)
    return await project.save()
  }

  async getProjectsByUser({ userId, search, isDeleted, page, limit }) {
    const query = {
      $and: [{ $or: [{ createdBy: userId }, { members: userId }] }],
    }

    if (isDeleted !== undefined) {
      query.$and.push({ isDeleted: isDeleted === "true" })
    }

    if (search) {
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }, // optional
        ],
      })
    }

    console.log("query", query)
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const projects = await ProjectModel.find(query)
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(parseInt(limit))

    const total = await ProjectModel.countDocuments(query)

    return {
      data: projects,
      totalCount: total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    }
  }
  async getProjectById(projectId) {
    try {
      return await ProjectModel.findById(projectId)
        .populate("createdBy", "name email")
        .populate("members", "name email")
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async updateProjectById(projectId, data) {
    try {
      return await ProjectModel.findByIdAndUpdate(projectId, data, {
        new: true,
      })
        .populate("createdBy", "name email")
        .populate("members", "name email")
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async deleteProjectById(projectId) {
    try {
      return await ProjectModel.findByIdAndDelete(projectId)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async addMemberToProject(projectId, userId) {
    try {
      return await ProjectModel.findByIdAndUpdate(
        projectId,
        { $addToSet: { members: userId } },
        { new: true }
      )
        .populate("createdBy", "name email")
        .populate("members", "name email")
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async removeMemberFromProject(projectId, userId) {
    try {
      return await ProjectModel.findByIdAndUpdate(
        projectId,
        { $pull: { members: userId } },
        { new: true }
      )
        .populate("createdBy", "name email")
        .populate("members", "name email")
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

export default new ProjectService()
