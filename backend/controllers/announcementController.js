
import Announcement from "../models/Announcement.js";

export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience = "all", expiresAt } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required."
      });
    }

    if (!["all", "hr", "employee"].includes(audience)) {
      return res.status(400).json({
        success: false,
        message: "Invalid audience."
      });
    }

    let expiry = null;

    if (expiresAt) {
      expiry = new Date(expiresAt);

      if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Expiry date must be in the future."
        });
      }
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      audience,
      expiresAt: expiry,
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Announcement published.",
      announcement
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const now = new Date();

    const audienceFilter =
      req.user.role === "admin"
        ? ["all", "hr", "employee"]
        : req.user.role === "hr"
          ? ["all", "hr"]
          : ["all", "employee"];

    const announcements = await Announcement.find({
      audience: { $in: audienceFilter },
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    })
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(
      req.params.id
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Announcement deleted."
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid announcement ID."
    });
  }
};
