
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    date: {
      type: String,
      required: true
    },
    checkIn: {
      type: Date,
      default: null
    },
    checkOut: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["present", "late", "absent", "half-day", "leave"],
      default: "present"
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

attendanceSchema.index(
  { employee: 1, date: 1 },
  { unique: true }
);

export default mongoose.model("Attendance", attendanceSchema);
