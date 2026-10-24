
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Organization from "../models/Organization.js";

const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from .env");
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// FIRST-RUN SETUP: only works before the first Admin exists
export const setupOrganization = async (req, res) => {
  try {
    const adminExists = await User.exists({ role: "admin" });
    console.log(adminExists)
    if (adminExists) {
      return res.status(403).json({
        success: false,
        message: "Initial setup has already been completed.",
      });
    }

    const { companyName, name, email, password } = req.body;

    if (!companyName?.trim() || !name?.trim() ||
      !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Company name, admin name, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const existingOrganization = await Organization.findOne();
    if (!existingOrganization) {
      return res.status(409).json({
        success: false,
        message: "Organization already exists. Contact the system administrator.",
      });
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    const organization = await Organization.create({
      name: companyName.trim(),
    });

    const hashedPassword = await bcrypt.hash(password, 12);

    let admin;

    try {
      admin = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: "admin",
      });
    } catch (error) {
      await Organization.findByIdAndDelete(organization._id);
      throw error;
    }

    const token = createToken(admin._id);

    return res.status(201).json({
      success: true,
      message: "Organization and Admin created successfully.",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Setup error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Setup failed.",
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user._id);

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
};

// CURRENT LOGGED-IN USER
export const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      employeeId: req.user.employeeId,
      department: req.user.department,
      designation: req.user.designation,
      phone: req.user.phone,
      address: req.user.address,
      mustChangePassword: req.user.mustChangePassword,
    },
  });
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new passwords are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    const user = await User.findById(req.user._id).select(
      "+password"
    );

    const matches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!matches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.mustChangePassword = false;

    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    console.error("Password change error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not change password.",
    });
  }
};
