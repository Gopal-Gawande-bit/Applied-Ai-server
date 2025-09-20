import UserModel from "../models/user-model.js"

class UserService {
  async findUser(filter) {
    const user = await UserModel.findOne(filter)
    return user
  }

  async getAllUsers({
    search,
    isAdmin,
    isDeleted,
    page,
    limit,
    sortBy,
    sortOrder,
  }) {
    const query = {}

    // Filter by isAdmin
    if (isAdmin !== undefined) {
      query.isAdmin = isAdmin === "true"
    }

    // Filter by isDeleted
    if (isDeleted !== undefined) {
      query.isDeleted = isDeleted === "true"
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Sorting
    const sortOption = {}
    sortOption[sortBy] = sortOrder === "desc" ? -1 : 1

    const users = await UserModel.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))

    const total = await UserModel.countDocuments(query)

    return {
      data: users,
      totalCount: total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    }
  }

  async getUserById(userId) {
    try {
      return await UserModel.findById(userId)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async updateUserById(userId, data) {
    try {
      return await UserModel.findByIdAndUpdate(userId, data, { new: true })
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async deleteUserById(userId) {
    try {
      return await UserModel.findByIdAndDelete(userId)
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

export default new UserService()
