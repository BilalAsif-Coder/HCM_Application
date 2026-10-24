
import { useEffect, useState } from "react";
import {
  Wallet,
  RefreshCw,
  Search,
  Plus,
  CheckCircle2,
  Clock3,
  X,
  Users,
  Banknote,
  CalendarDays,
} from "lucide-react";

import api from "../api/axios";
import "./Payroll.css";

export default function Payroll() {
  const [user, setUser] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const now = new Date();

  const [form, setForm] = useState({
    employeeId: "",
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
    deductions: "0",
  });

  const role = user?.role || "employee";
  const isEmployee = role === "employee";
  const isAdmin = role === "admin";
  const canManage = role === "admin" || role === "hr";

  const getUser = (data) =>
    data?.user || data?.data?.user || data?.data || data;

  const getPayrollList = (data) => {
    const list =
      data?.payrolls ||
      data?.data?.payrolls ||
      data?.data ||
      [];

    return Array.isArray(list) ? list : [];
  };

  const getEmployeeList = (data) => {
    const list =
      data?.employees ||
      data?.data?.employees ||
      data?.data ||
      [];

    return Array.isArray(list) ? list : [];
  };

  const loadPayroll = async () => {
    try {
      setLoading(true);
      setError("");

      const userResponse = await api.get("/auth/me");
      const currentUser = getUser(userResponse.data);
      setUser(currentUser);

      const endpoint =
        currentUser?.role === "employee"
          ? "/payroll/my"
          : "/payroll";

      const payrollResponse = await api.get(endpoint);
      setPayrolls(getPayrollList(payrollResponse.data));

      if (
        currentUser?.role === "admin" ||
        currentUser?.role === "hr"
      ) {
        try {
          const employeeResponse = await api.get("/employees");
          setEmployees(getEmployeeList(employeeResponse.data));
        } catch {
          setEmployees([]);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Payroll records load nahi ho sake."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, []);

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const formatMonth = (month, year) => {
    const monthNumber = Number(month);

    if (monthNumber < 1 || monthNumber > 12) {
      return `${month} ${year}`;
    }

    return `${new Date(
      Number(year),
      monthNumber - 1
    ).toLocaleString("en", { month: "long" })} ${year}`;
  };

  const employeeName = (record) => {
    const employee = record?.employee;

    if (employee && typeof employee === "object") {
      return (
        employee.name ||
        employee.fullName ||
        employee.email ||
        "Employee"
      );
    }

    return "Employee";
  };

  const employeeId = (employee) =>
    employee?._id || employee?.id || "";

  const filteredPayrolls = payrolls.filter((record) => {
    const name = employeeName(record).toLowerCase();
    const email =
      typeof record.employee === "object"
        ? record.employee?.email?.toLowerCase() || ""
        : "";

    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPayroll = filteredPayrolls.reduce(
    (sum, record) => sum + (Number(record.netSalary) || 0),
    0
  );

  const paidPayrolls = filteredPayrolls.filter(
    (record) => record.status === "paid"
  );

  const pendingPayrolls = filteredPayrolls.filter(
    (record) => record.status !== "paid"
  );

  const handleGenerate = async (event) => {
    event.preventDefault();

    if (!form.employeeId) {
      setError("Pehle employee select karo.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setNotice("");

      const response = await api.post("/payroll/generate", {
        employeeId: form.employeeId,
        month: Number(form.month),
        year: Number(form.year),
        deductions: Number(form.deductions) || 0,
      });

      setNotice(
        response.data?.message || "Payroll successfully generate ho gaya."
      );
      setShowForm(false);
      await loadPayroll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Payroll generate nahi ho saka."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (id) => {
    if (!id) return;

    try {
      setError("");
      setNotice("");

      const response = await api.patch(`/payroll/${id}/pay`);

      setNotice(response.data?.message || "Payroll paid mark ho gaya.");
      await loadPayroll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Payroll paid mark nahi ho saka."
      );
    }
  };

  return (
    <div className="payroll-page">
      <header className="payroll-header">
        <div className="payroll-title-area">
          <div className="payroll-title-icon">
            <Wallet size={25} />
          </div>

          <div>
            <p className="payroll-eyebrow">HCM LITE / FINANCE</p>
            <h1>Payroll Management</h1>
            <p className="payroll-subtitle">
              {isEmployee
                ? "View your salary records and payment history."
                : "Manage salaries, deductions, and employee payments."}
            </p>
          </div>
        </div>

        <div className="payroll-header-actions">
          <button
            className="payroll-refresh"
            onClick={loadPayroll}
            disabled={loading}
            title="Refresh payroll"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          {canManage && (
            <button
              className="payroll-generate-button"
              onClick={() => {
                setError("");
                setNotice("");
                setShowForm(true);
              }}
            >
              <Plus size={18} />
              Generate Payroll
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="payroll-message payroll-error">
          {error}
          <button onClick={() => setError("")} aria-label="Dismiss error">
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div className="payroll-message payroll-success">
          <CheckCircle2 size={17} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss message">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="payroll-stats">
        <div className="payroll-stat-card">
          <div className="payroll-stat-icon stat-blue">
            <Banknote size={22} />
          </div>
          <p>{isEmployee ? "Total Net Salary" : "Total Net Payroll"}</p>
          <h2>{loading ? "..." : formatMoney(totalPayroll)}</h2>
          <span>Based on displayed records</span>
        </div>

        <div className="payroll-stat-card">
          <div className="payroll-stat-icon stat-green">
            <CheckCircle2 size={22} />
          </div>
          <p>Paid Records</p>
          <h2>{loading ? "..." : paidPayrolls.length}</h2>
          <span>Successfully marked paid</span>
        </div>

        <div className="payroll-stat-card">
          <div className="payroll-stat-icon stat-orange">
            <Clock3 size={22} />
          </div>
          <p>Pending Records</p>
          <h2>{loading ? "..." : pendingPayrolls.length}</h2>
          <span>Awaiting payment</span>
        </div>

        <div className="payroll-stat-card">
          <div className="payroll-stat-icon stat-purple">
            <Users size={22} />
          </div>
          <p>Payroll Records</p>
          <h2>{loading ? "..." : payrolls.length}</h2>
          <span>Records available</span>
        </div>
      </section>

      <section className="payroll-table-card">
        <div className="payroll-table-heading">
          <div>
            <h2>{isEmployee ? "My Salary History" : "Payroll Records"}</h2>
            <p>Review salary details and payment status.</p>
          </div>

          <div className="payroll-filters">
            <label className="payroll-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employee..."
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by payment status"
            >
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="payroll-table-wrapper">
          <table className="payroll-table">
            <thead>
              <tr>
                {!isEmployee && <th>Employee</th>}
                <th>Pay Period</th>
                <th>Basic Salary</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 8 : isEmployee ? 6 : 7}
                    className="payroll-empty-cell"
                  >
                    Loading payroll records...
                  </td>
                </tr>
              ) : filteredPayrolls.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 8 : isEmployee ? 6 : 7}
                    className="payroll-empty-cell"
                  >
                    <CalendarDays size={28} />
                    <strong>No payroll records found</strong>
                    <span>
                      {search || statusFilter !== "all"
                        ? "Try changing your search or filter."
                        : "Generated payroll records will appear here."}
                    </span>
                  </td>
                </tr>
              ) : (
                filteredPayrolls.map((record) => (
                  <tr key={record._id}>
                    {!isEmployee && (
                      <td>
                        <div className="payroll-employee-cell">
                          <div className="payroll-employee-avatar">
                            {employeeName(record).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{employeeName(record)}</strong>
                            <span>
                              {typeof record.employee === "object"
                                ? record.employee?.email || "Employee"
                                : "Employee"}
                            </span>
                          </div>
                        </div>
                      </td>
                    )}

                    <td className="payroll-period">
                      {formatMonth(record.month, record.year)}
                    </td>
                    <td>{formatMoney(record.basicSalary)}</td>
                    <td>{formatMoney(record.allowances)}</td>
                    <td className="payroll-deduction">
                      {formatMoney(record.deductions)}
                    </td>
                    <td className="payroll-net">
                      {formatMoney(record.netSalary)}
                    </td>
                    <td>
                      <span
                        className={`payroll-status ${
                          record.status === "paid"
                            ? "status-paid"
                            : "status-pending"
                        }`}
                      >
                        {record.status === "paid" ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Clock3 size={14} />
                        )}
                        {record.status || "pending"}
                      </span>
                    </td>

                    {isAdmin && (
                      <td>
                        {record.status === "paid" ? (
                          <span className="payroll-action-complete">
                            <CheckCircle2 size={15} />
                            Paid
                          </span>
                        ) : (
                          <button
                            className="payroll-mark-paid"
                            onClick={() => handleMarkPaid(record._id)}
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="payroll-table-footer">
          Showing {loading ? 0 : filteredPayrolls.length} of{" "}
          {payrolls.length} records
        </div>
      </section>

      {showForm && (
        <div
          className="payroll-modal-backdrop"
          onClick={() => setShowForm(false)}
        >
          <section
            className="payroll-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="generate-payroll-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="payroll-modal-header">
              <div>
                <div className="payroll-modal-icon">
                  <Wallet size={22} />
                </div>
                <h2 id="generate-payroll-title">Generate Payroll</h2>
                <p>Select an employee and pay period.</p>
              </div>

              <button
                className="payroll-modal-close"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerate}>
              <label className="payroll-form-field">
                <span>Employee</span>
                <select
                  value={form.employeeId}
                  onChange={(event) =>
                    setForm({ ...form, employeeId: event.target.value })
                  }
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option
                      key={employeeId(employee)}
                      value={employeeId(employee)}
                    >
                      {employee.name ||
                        employee.fullName ||
                        employee.email ||
                        "Employee"}
                      {employee.employeeId
                        ? ` (${employee.employeeId})`
                        : ""}
                    </option>
                  ))}
                </select>

                {employees.length === 0 && (
                  <small>
                    No employees loaded. Check the employees API and make
                    sure employee records exist.
                  </small>
                )}
              </label>

              <div className="payroll-form-row">
                <label className="payroll-form-field">
                  <span>Month</span>
                  <select
                    value={form.month}
                    onChange={(event) =>
                      setForm({ ...form, month: event.target.value })
                    }
                    required
                  >
                    {Array.from({ length: 12 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {new Date(2025, index).toLocaleString("en", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="payroll-form-field">
                  <span>Year</span>
                  <input
                    type="number"
                    min="2020"
                    max="2100"
                    value={form.year}
                    onChange={(event) =>
                      setForm({ ...form, year: event.target.value })
                    }
                    required
                  />
                </label>
              </div>

              <label className="payroll-form-field">
                <span>Deductions (PKR)</span>
                <input
                  type="number"
                  min="0"
                  value={form.deductions}
                  onChange={(event) =>
                    setForm({ ...form, deductions: event.target.value })
                  }
                  required
                />
              </label>

              <div className="payroll-form-note">
                Basic salary and allowances are taken from the employee
                record. Net salary is calculated by the backend.
              </div>

              <div className="payroll-modal-actions">
                <button
                  type="button"
                  className="payroll-cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="payroll-generate-button"
                  disabled={submitting || employees.length === 0}
                >
                  {submitting ? "Generating..." : "Generate Payroll"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
