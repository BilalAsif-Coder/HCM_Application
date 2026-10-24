
import Leave from "../models/Leave.js";

export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "All leave fields are required."
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start.toISOString().slice(0, 10) !== startDate ||
      end.toISOString().slice(0, 10) !== endDate ||
      end < start
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid dates. End date must be on or after start date."
      });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason: reason.trim()
    });

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully.",
      leave
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      employee: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid leave status."
        });
      }

      filter.status = status;
    }

    const leaves = await Leave.find(filter)
      .populate("employee", "name email employeeId department designation")
      .populate("reviewedBy", "name role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const reviewLeave = async (req, res) => {
  try {
    const { status, reviewComment = "" } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected."
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found."
      });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This leave request has already been reviewed."
      });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewComment = reviewComment.trim();

    await leave.save();

    return res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully.`,
      leave
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
