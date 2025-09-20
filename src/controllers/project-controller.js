import projectService from "../services/project-service.js"

class ProjectController {
  async createProject(req, res) {
    try {
      const { name, description, members } = req.body

      if (!name || !description) {
        return res.status(400).json({
          message: "Name and description are required fields",
        })
      }

      const createdBy = req.user?.userId
      if (!createdBy) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const newProject = await projectService.createProject({
        name,
        description,
        createdBy,
        members: members || [],
      })

      res.status(201).json(newProject)
    } catch (error) {
      console.error(error)
      res.status(400).json({
        // 400 since invalid members are client error
        message: error.message,
      })
    }
  }

  async getProjects(req, res) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const { page = 1, limit = 10, search = "", isDeleted } = req.query

      const filters = { userId, search, isDeleted, page, limit }

      const result = await projectService.getProjectsByUser(filters)

      res.status(200).json(result)
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message })
    }
  }

  async getProjectById(req, res) {
    const { projectId } = req.params

    try {
      const project = await projectService.getProjectById(projectId)
      if (!project) {
        return res.status(404).json({ message: "Project not found" })
      }
      res.status(200).json(project)
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async updateProject(req, res) {
    const { projectId } = req.params
    const updateData = req.body

    try {
      const updatedProject = await projectService.updateProjectById(
        projectId,
        updateData
      )
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" })
      }
      res.status(200).json(updatedProject)
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async deleteProject(req, res) {
    const { projectId } = req.params

    try {
      const deletedProject = await projectService.deleteProjectById(projectId)
      if (!deletedProject) {
        return res.status(404).json({ message: "Project not found" })
      }
      res.status(200).json({ message: "Project deleted successfully" })
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async addMember(req, res) {
    const { projectId } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" })
    }

    try {
      const updatedProject = await projectService.addMemberToProject(
        projectId,
        userId
      )
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" })
      }
      res.status(200).json(updatedProject)
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async removeMember(req, res) {
    const { projectId } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" })
    }

    try {
      const updatedProject = await projectService.removeMemberFromProject(
        projectId,
        userId
      )
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" })
      }
      res.status(200).json(updatedProject)
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }
}

export default new ProjectController()
