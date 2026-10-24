
import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const createEmployee = async (req, res) => {
  try {
    const {
      name, email, password, employeeId, department,
      designation, phone, address, basicSalary, allowances
    } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered."
      });
    }

    const employee = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      role: "employee",
      employeeId: employeeId?.trim() || `EMP-${Date.now()}`,
      department: department || "",
      designation: designation || "",
      phone: phone || "",
      address: address || "",
      basicSalary: basicSalary ?? 0,
      allowances: allowances ?? 0,
      mustChangePassword: true
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully.",
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        role: employee.role
      }
    });
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 500).json({
      success: false,
      message: error.code === 11000
        ? "Email or employee ID already exists."
        : error.message
    });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const filter = { role: "employee" };

    if (req.query.includeInactive !== "true") {
      filter.isActive = true;
    }

    const employees = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      role: "employee"
    }).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found."
      });
    }

    return res.status(200).json({ success: true, employee });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid employee ID."
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      role: "employee"
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found."
      });
    }

    const allowedFields = [
      "name", "department", "designation", "phone",
      "address", "basicSalary", "allowances", "employeeId"
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        employee[field] = req.body[field];
      }
    }

    if (req.body.email !== undefined) {
      employee.email = req.body.email.trim().toLowerCase();
    }

    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully.",
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        department: employee.department,
        designation: employee.designation,
        phone: employee.phone,
        address: employee.address,
        basicSalary: employee.basicSalary,
        allowances: employee.allowances,
        isActive: employee.isActive
      }
    });
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message: error.code === 11000
        ? "Email or employee ID already exists."
        : error.message
    });
  }
};

export const deactivateEmployee = async (req, res) => {
  try {
    const employee = await User.findOneAndUpdate(
      { _id: req.params.id, role: "employee" },
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee deactivated successfully."
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid employee ID."
    });
  }
};
