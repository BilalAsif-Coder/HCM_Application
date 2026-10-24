
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CalendarDays,
  LogIn,
  LogOut,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import api from "../api/axios";
import "./Attendance.css";

export default function Attendance() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const todayRecord = records.find((item) => item.date === today);

  const loadAttendance = async () => {
    setLoading(true);
    setError("");

    try {
      const meResponse = await api.get("/auth/me");
      const currentUser = meResponse.data.user || meResponse.data;
      setUser(currentUser);

      const endpoint =
        currentUser.role === "employee"
          ? "/attendance/my"
          : "/attendance";

      const response = await api.get(endpoint);
      setRecords(response.data.attendance || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load attendance records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleAction = async (action) => {
    setActionLoading(true);
    setNotice("");
    setError("");

    try {
      const response = await api.post(`/attendance/${action}`);
      setNotice(response.data.message || "Attendance updated.");
      await loadAttendance();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Attendance action failed."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (value) => {
    if (!value) return "—";

    return new Intl.DateTimeFormat("en-PK", {
      timeZone: "Asia/Karachi",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(value));
  };

  const formatDate = (value) => {
    if (!value) return "—";

    return new Date(`${value}T12:00:00`).toLocaleDateString(
      "en-PK",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Karachi",
      }
    );
  };

  const statusClass = (status) =>
    `attendance-status ${status || "present"}`;

  return (
    <div className="attendance-page">
      <header className="attendance-header">
        <button
          className="attendance-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} /> Dashboard
        </button>

        <div>
          <h1>Attendance</h1>
          <p>Track working hours and attendance records.</p>
        </div>

        <button
          className="attendance-refresh"
          onClick={loadAttendance}
          disabled={loading}
          title="Refresh records"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      {notice && <div className="attendance-notice">{notice}</div>}
      {error && <div className="attendance-error">{error}</div>}

      {user?.role === "employee" && (
        <section className="attendance-check-card">
          <div className="attendance-check-info">
            <span className="attendance-icon">
              <Clock size={25} />
            </span>
            <div>
              <h2>Today's Attendance</h2>
              <p>{formatDate(today)}</p>
              <span className={statusClass(todayRecord?.status)}>
                {todayRecord?.status || "Not checked in"}
              </span>
            </div>
          </div>

          <div className="attendance-times">
            <div>
              <span>Check-in</span>
              <strong>{formatTime(todayRecord?.checkIn)}</strong>
            </div>
            <div>
              <span>Check-out</span>
              <strong>{formatTime(todayRecord?.checkOut)}</strong>
            </div>
          </div>

          <div className="attendance-actions">
            <button
              className="attendance-checkin-btn"
              onClick={() => handleAction("check-in")}
              disabled={actionLoading || Boolean(todayRecord)}
            >
              <LogIn size={18} />
              {todayRecord ? "Checked In" : "Check In"}
            </button>

            <button
              className="attendance-checkout-btn"
              onClick={() => handleAction("check-out")}
              disabled={
                actionLoading ||
                !todayRecord ||
                Boolean(todayRecord?.checkOut)
              }
            >
              <LogOut size={18} />
              {todayRecord?.checkOut ? "Checked Out" : "Check Out"}
            </button>
          </div>
        </section>
      )}

      <section className="attendance-records-card">
        <div className="attendance-records-heading">
          <div>
            <h2>Attendance History</h2>
            <p>
              {user?.role === "employee"
                ? "Your recent attendance records"
                : "Attendance records for all employees"}
            </p>
          </div>
          <CalendarDays size={23} />
        </div>

        {loading ? (
          <div className="attendance-empty">Loading attendance...</div>
        ) : records.length === 0 ? (
          <div className="attendance-empty">
            No attendance records found.
          </div>
        ) : (
          <div className="attendance-table-wrap">
            <table className="attendance-table">
              <thead>
                <tr>
                  {user?.role !== "employee" && <th>Employee</th>}
                  <th>Date</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    {user?.role !== "employee" && (
                      <td>
                        <strong>
                          {record.employee?.name || "Unknown"}
                        </strong>
                        <small>
                          {record.employee?.employeeId ||
                            record.employee?.email ||
                            ""}
                        </small>
                      </td>
                    )}
                    <td>{formatDate(record.date)}</td>
                    <td>{formatTime(record.checkIn)}</td>
                    <td>{formatTime(record.checkOut)}</td>
                    <td>
                      <span className={statusClass(record.status)}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
