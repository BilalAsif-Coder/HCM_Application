
import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    officeStart: {
      type: String,
      default: "09:00",
    },
    officeEnd: {
      type: String,
      default: "17:00",
    },
    graceMinutes: {
      type: Number,
      default: 15,
    },
    weekendDays: {
      type: [Number],
      default: [0],
    },
    officeLocation: {
      type: String,
      default: "",
    },
    officeRadiusMeters: {
      type: Number,
      default: 200,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Organization",
  organizationSchema
);
