
import Payroll from "../models/Payroll.js";
import User from "../models/User.js";

export const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year, deductions = 0 } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, month and year are required."
      });
    }

    if (
      !Number.isInteger(Number(month)) ||
      Number(month) < 1 ||
      Number(month) > 12 ||
      !Number.isInteger(Number(year)) ||
      Number(year) < 2000 ||
      Number(year) > 2100 ||
      !Number.isFinite(Number(deductions)) ||
      Number(deductions) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid month, year or deductions."
      });
    }

    const employee = await User.findOne({
      _id: employeeId,
      role: "employee",
      isActive: true
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Active employee not found."
      });
    }

    const basicSalary = employee.basicSalary;
    const allowances = employee.allowances;
    const netSalary = basicSalary + allowances - Number(deductions);

    if (netSalary < 0) {
      return res.status(400).json({
        success: false,
        message: "Deductions cannot exceed total salary."
      });
    }

    const payroll = await Payroll.create({
      employee: employee._id,
      month: Number(month),
      year: Number(year),
      basicSalary,
      allowances,
      deductions: Number(deductions),
      netSalary
    });

    return res.status(201).json({
      success: true,
      message: "Payroll generated successfully.",
      payroll
    });
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 500).json({
      success: false,
      message: error.code === 11000
        ? "Payroll already exists for this employee and month."
        : error.message
    });
  }
};

export const getMyPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.find({
      employee: req.user._id
    }).sort({ year: -1, month: -1 });

    return res.status(200).json({
      success: true,
      count: payrolls.length,
      payrolls
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate("employee", "name email employeeId department")
      .sort({ year: -1, month: -1 });

    return res.status(200).json({
      success: true,
      count: payrolls.length,
      payrolls
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const markPayrollPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found."
      });
    }

    if (payroll.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payroll is already marked as paid."
      });
    }

    payroll.status = "paid";
    payroll.paidAt = new Date();

    await payroll.save();

    return res.status(200).json({
      success: true,
      message: "Payroll marked as paid.",
      payroll
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
