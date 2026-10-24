
import Attendance from "../models/Attendance.js";

// Get today's date in Pakistan time
const getTodayDate = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

// Employee Check-in
export const checkIn = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Only employees can check in.",
      });
    }

    const today = getTodayDate();

    const existingAttendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked for today.",
      });
    }

    const now = new Date();

    const karachiTime = new Date(
      now.toLocaleString("en-US", {
        timeZone: "Asia/Karachi",
      })
    );

    const minutes =
      karachiTime.getHours() * 60 + karachiTime.getMinutes();

    // Late after 9:15 AM Pakistan time
    const status = minutes > 555 ? "late" : "present";

    const attendance = await Attendance.create({
      employee: req.user._id,
      date: today,
      checkIn: now,
      status,
    });

    return res.status(201).json({
      success: true,
      message:
        status === "late"
          ? "Check-in successful. You are marked late."
          : "Check-in successful.",
      attendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked for today.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Employee Check-out
export const checkOut = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Only employees can check out.",
      });
    }

    const today = getTodayDate();

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Please check in first.",
      });
    }

    if (attendance.checkOut) {
      return res.status(409).json({
        success: false,
        message: "You have already checked out.",
      });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Check-out successful.",
      attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Employee's Own Attendance History
export const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      employee: req.user._id,
    }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin/HR Attendance Records
export const getAllAttendance = async (req, res) => {
  try {
    const filter = {};

    if (req.query.date) {
      filter.date = req.query.date;
    }

    if (req.query.employeeId) {
      filter.employee = req.query.employeeId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const attendance = await Attendance.find(filter)
      .populate(
        "employee",
        "name email employeeId department designation"
      )
      .sort({ date: -1, checkIn: -1 })
      .limit(500);

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
