
import User from "../models/User.js";
import Department from "../models/Department.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Payroll from "../models/Payroll.js";

export const getDashboardStats = async (req, res) => {
  try {
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());

    const [
      totalEmployees,
      totalDepartments,
      todayAttendance,
      pendingLeaves,
      monthlyPayroll
    ] = await Promise.all([
      User.countDocuments({ role: "employee", isActive: true }),
      Department.countDocuments({ isActive: true }),
      Attendance.countDocuments({ date }),
      Leave.countDocuments({ status: "pending" }),
      Payroll.countDocuments({
        month: Number(date.slice(5, 7)),
        year: Number(date.slice(0, 4))
      })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        totalDepartments,
        todayAttendance,
        pendingLeaves,
        monthlyPayroll
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
