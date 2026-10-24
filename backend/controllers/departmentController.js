
import Department from "../models/Department.js";

export const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department name is required."
      });
    }

    const existingDepartment = await Department.findOne({
      name: name.trim()
    });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: "Department already exists."
      });
    }

    const department = await Department.create({
      name: name.trim(),
      description
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully.",
      department
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: departments.length,
      departments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found."
      });
    }

    return res.status(200).json({
      success: true,
      department
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid department ID."
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Department name cannot be empty."
        });
      }

      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (isActive !== undefined) {
      updates.isActive = isActive;
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Department updated successfully.",
      department
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.code === 11000
        ? "Department name already exists."
        : error.message
    });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(
      req.params.id
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully."
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid department ID."
    });
  }
};
