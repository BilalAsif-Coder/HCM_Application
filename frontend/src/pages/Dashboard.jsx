
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Wallet,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Building2,
  ClipboardList,
  RefreshCw,
} from "lucide-react";

import api from "../api/axios";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Employees", icon: Users },
    { label: "Attendance", icon: CalendarDays },
    { label: "Payroll", icon: Wallet },
  ];

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/auth/me");

      const currentUser =
        response.data?.user ||
        response.data?.data?.user ||
        response.data?.data ||
        response.data;

      setUser(currentUser);

      try {
        const statsResponse = await api.get("/dashboard/stats");

        setStats(
          statsResponse.data?.stats ||
            statsResponse.data?.data ||
            statsResponse.data
        );
      } catch {
        setStats(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Dashboard data load nahi ho saka."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const openModule = (label) => {
    setSidebarOpen(false);

    if (label === "Dashboard") {
      navigate("/");
    } else if (label === "Employees") {
      navigate("/employees");
    } else if (label === "Attendance") {
      navigate("/attendance");
    } else if (label === "Payroll") {
      navigate("/payroll");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const getStat = (...keys) => {
    for (const key of keys) {
      if (stats?.[key] !== undefined && stats?.[key] !== null) {
        return stats[key];
      }
    }

    return 0;
  };

  const name =
    user?.name || user?.fullName || user?.username || "User";

  const role = user?.role || "employee";

  return (
    <div className="hcm-layout">
      {sidebarOpen && (
        <button
          className="hcm-overlay"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`hcm-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="hcm-brand">
          <div className="hcm-brand-icon">
            <Building2 size={22} />
          </div>

          <span>
            HCM <b>Lite</b>
          </span>

          <button
            className="hcm-close-menu"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <div className="hcm-nav-label">MAIN MENU</div>

        <nav className="hcm-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`hcm-nav-item ${
                label === "Dashboard" ? "active" : ""
              }`}
              onClick={() => openModule(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="hcm-sidebar-bottom">
          <div className="hcm-secure-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <strong>HCM Workspace</strong>
            <p>Secure workspace</p>
          </div>
        </div>
      </aside>

      <main className="hcm-main">
        <header className="hcm-topbar">
          <button
            className="hcm-menu-toggle"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="hcm-breadcrumb">
            Workspace <span>/</span> <strong>Dashboard</strong>
          </div>

          <div className="hcm-top-actions">
            <button
              className="hcm-icon-button"
              onClick={loadDashboard}
              disabled={loading}
              title="Refresh dashboard"
            >
              <RefreshCw size={17} />
            </button>

            <div className="hcm-user-avatar">
              {name.charAt(0).toUpperCase()}
            </div>

            <div className="hcm-user-meta">
              <strong>{name}</strong>
              <span>{role}</span>
            </div>

            <button
              className="hcm-logout"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <section className="hcm-content">
          <div className="hcm-welcome">
            <div>
              <p className="hcm-eyebrow">
                HUMAN CAPITAL MANAGEMENT
              </p>

              <h1>Welcome back, {name.split(" ")[0]}!</h1>

              <p className="hcm-subtitle">
                Here's an overview of your workspace.
              </p>
            </div>

            <div className="hcm-date-chip">
              <CalendarDays size={17} />

              {new Date().toLocaleDateString("en-PK", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "Asia/Karachi",
              })}
            </div>
          </div>

          {error && <div className="hcm-error">{error}</div>}

          <div className="hcm-stats-grid">
            <div className="hcm-stat-card">
              <div className="hcm-stat-top">
                <div className="hcm-stat-icon cyan">
                  <Users size={21} />
                </div>
                <span>Total Employees</span>
              </div>

              <h2>
                {loading
                  ? "..."
                  : getStat(
                      "totalEmployees",
                      "employeesCount",
                      "employees"
                    )}
              </h2>

              <p>Registered employee records</p>
            </div>

            <div className="hcm-stat-card">
              <div className="hcm-stat-top">
                <div className="hcm-stat-icon blue">
                  <CalendarDays size={21} />
                </div>
                <span>Present Today</span>
              </div>

              <h2>
                {loading
                  ? "..."
                  : getStat(
                      "presentToday",
                      "presentCount",
                      "present"
                    )}
              </h2>

              <p>Attendance marked present</p>
            </div>

            <div className="hcm-stat-card">
              <div className="hcm-stat-top">
                <div className="hcm-stat-icon purple">
                  <Wallet size={21} />
                </div>
                <span>Account Role</span>
              </div>

              <h2 style={{ textTransform: "capitalize" }}>
                {role}
              </h2>

              <p>Your workspace access level</p>
            </div>
          </div>

          <div className="hcm-lower-grid">
            <div className="hcm-panel">
              <div className="hcm-panel-heading">
                <div>
                  <h2>Quick Actions</h2>
                  <p>Quickly access your workspace modules.</p>
                </div>

                <div className="hcm-panel-icon">
                  <ClipboardList size={20} />
                </div>
              </div>

              <div className="hcm-empty-state">
                <div className="hcm-empty-icon">
                  <CalendarDays size={25} />
                </div>

                <h3>Manage Attendance</h3>

                <p>
                  Check in, check out, and review attendance
                  records from your attendance workspace.
                </p>
              </div>

              <button
                className="hcm-primary-button"
                onClick={() => openModule("Attendance")}
              >
                <CalendarDays size={17} />
                Open Attendance
              </button>

              <button
                className="hcm-secondary-button"
                onClick={() => openModule("Employees")}
              >
                <Users size={17} />
                View Employees
              </button>

              <button
                className="hcm-secondary-button"
                onClick={() => openModule("Payroll")}
              >
                <Wallet size={17} />
                Open Payroll
              </button>
            </div>

            <div className="hcm-panel">
              <div className="hcm-panel-heading">
                <div>
                  <h2>Account Overview</h2>
                  <p>Your current session details.</p>
                </div>

                <div className="hcm-panel-icon">
                  <ShieldCheck size={20} />
                </div>
              </div>

              <div className="hcm-profile">
                <div className="hcm-profile-avatar">
                  {name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3>{name}</h3>
                  <p>{user?.email || "Email not available"}</p>
                </div>
              </div>

              <div className="hcm-detail-row">
                <span>Role</span>
                <span className="hcm-role-badge">{role}</span>
              </div>

              <div className="hcm-detail-row">
                <span>Department</span>
                <strong>{user?.department || "Not assigned"}</strong>
              </div>

              <div className="hcm-detail-row">
                <span>Employee ID</span>
                <strong>{user?.employeeId || "Not assigned"}</strong>
              </div>

              <div className="hcm-detail-row">
                <span>Session</span>
                <span className="hcm-status">
                  <span />
                  Active
                </span>
              </div>

              <button
                className="hcm-secondary-button"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>

          <footer className="hcm-footer">
            <span>HCM Lite</span>
            <span>Human Capital Management System</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
