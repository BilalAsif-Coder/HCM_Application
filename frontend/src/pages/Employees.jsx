import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Plus,
  Users,
  Pencil,
  UserX,
  RefreshCw,
  X,
  LogOut,
} from "lucide-react";
import api from "../api/axios";
import "./Employees.css";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  employeeId: "",
  department: "",
  designation: "",
  phone: "",
  address: "",
  basicSalary: "0",
  allowances: "0",
};

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadEmployees = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/employees");
      setEmployees(response.data.employees || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Employees load nahi huay. Backend route aur permissions check karo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setModalOpen(true);
  };

  const openEdit = (employee) => {
    setEditingId(employee._id);
    setForm({
      ...emptyForm,
      name: employee.name || "",
      email: employee.email || "",
      employeeId: employee.employeeId || "",
      department: employee.department || "",
      designation: employee.designation || "",
      phone: employee.phone || "",
      address: employee.address || "",
      basicSalary: String(employee.basicSalary ?? 0),
      allowances: String(employee.allowances ?? 0),
      password: "",
    });
    setError("");
    setNotice("");
    setModalOpen(true);
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (editingId) {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          employeeId: form.employeeId.trim(),
          department: form.department.trim(),
          designation: form.designation.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          basicSalary: Number(form.basicSalary),
          allowances: Number(form.allowances),
        };

        await api.patch(`/employees/${editingId}`, payload);
        setNotice("Employee updated successfully.");
      } else {
        const payload = {
          ...form,
          name: form.name.trim(),
          email: form.email.trim(),
          employeeId: form.employeeId.trim(),
          department: form.department.trim(),
          designation: form.designation.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          basicSalary: Number(form.basicSalary),
          allowances: Number(form.allowances),
        };

        await api.post("/employees", payload);
        setNotice("Employee created successfully.");
      }

      setModalOpen(false);
      await loadEmployees();
      setNotice(editingId ? "Employee updated successfully." : "Employee created successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Save nahi hua. Employee API route aur required fields check karo."
      );
    } finally {
      setSaving(false);
    }
  };

  const deactivateEmployee = async (employee) => {
    const confirmed = window.confirm(
      `Kya aap ${employee.name} ko deactivate karna chahte hain?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await api.patch(`/employees/${employee._id}/deactivate`);
      setNotice(`${employee.name} deactivated successfully.`);
      await loadEmployees();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Employee deactivate nahi ho saka. Backend route check karo."
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const filteredEmployees = employees.filter((employee) => {
    const text = [
      employee.name,
      employee.email,
      employee.employeeId,
      employee.department,
      employee.designation,
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <div className="emp-page">
      <header className="emp-topbar">
        <button className="emp-back" onClick={() => navigate("/")}>
          <ArrowLeft size={18} /> Dashboard
        </button>

        <div className="emp-brand">
          <span className="emp-brand-mark"><Users size={20} /></span>
          HCM <b>Lite</b>
        </div>

        <button className="emp-logout" onClick={logout} title="Sign out">
          <LogOut size={18} /> Sign out
        </button>
      </header>

      <main className="emp-content">
        <div className="emp-heading">
          <div>
            <p className="emp-eyebrow">WORKSPACE / PEOPLE</p>
            <h1>Employee Management</h1>
            <p className="emp-subtitle">
              Add, search, edit and manage employee records.
            </p>
          </div>

          <button className="emp-primary" onClick={openAdd}>
            <Plus size={18} /> Add Employee
          </button>
        </div>

        {error && <div className="emp-alert emp-alert-error">{error}</div>}
        {notice && <div className="emp-alert emp-alert-success">{notice}</div>}

        <section className="emp-summary">
          <div className="emp-summary-icon"><Users size={23} /></div>
          <div>
            <span>Active employees loaded</span>
            <strong>{loading ? "…" : employees.length}</strong>
          </div>
          <button
            className="emp-refresh"
            onClick={loadEmployees}
            disabled={loading}
            title="Refresh employees"
          >
            <RefreshCw size={17} /> Refresh
          </button>
        </section>

        <section className="emp-table-card">
          <div className="emp-table-heading">
            <div>
              <h2>Employee Directory</h2>
              <p>Employee records from your database</p>
            </div>

            <label className="emp-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, ID, department..."
              />
            </label>
          </div>

          {loading ? (
            <div className="emp-empty">Loading employee records…</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="emp-empty">
              <Users size={35} />
              <h3>{search ? "No matching employees" : "No employees yet"}</h3>
              <p>
                {search
                  ? "Try another search term."
                  : "Add your first employee to populate this directory."}
              </p>
              {!search && (
                <button className="emp-primary" onClick={openAdd}>
                  <Plus size={18} /> Add Employee
                </button>
              )}
            </div>
          ) : (
            <div className="emp-table-scroll">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id}>
                      <td>
                        <div className="emp-person">
                          <div className="emp-avatar">
                            {(employee.name || "E").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{employee.name}</strong>
                            <span>{employee.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>{employee.employeeId || "—"}</td>
                      <td>{employee.department || "—"}</td>
                      <td>{employee.designation || "—"}</td>
                      <td>
                        <span className="emp-status">
                          <i /> Active
                        </span>
                      </td>
                      <td>
                        <div className="emp-actions">
                          <button
                            className="emp-action-edit"
                            title="Edit employee"
                            onClick={() => openEdit(employee)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="emp-action-delete"
                            title="Deactivate employee"
                            onClick={() => deactivateEmployee(employee)}
                          >
                            <UserX size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {modalOpen && (
        <div
          className="emp-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <section className="emp-modal">
            <div className="emp-modal-heading">
              <div>
                <p className="emp-eyebrow">
                  {editingId ? "UPDATE RECORD" : "NEW RECORD"}
                </p>
                <h2>{editingId ? "Edit Employee" : "Add Employee"}</h2>
              </div>
              <button
                className="emp-close"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Close"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="emp-form-grid">
                <label>
                  Full name *
                  <input name="name" value={form.name} onChange={updateField} required />
                </label>

                <label>
                  Email address *
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    required
                  />
                </label>

                {!editingId && (
                  <label>
                    Temporary password * (minimum 8 characters)
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={updateField}
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />
                  </label>
                )}

                <label>
                  Employee ID
                  <input name="employeeId" value={form.employeeId} onChange={updateField} />
                </label>

                <label>
                  Department
                  <input name="department" value={form.department} onChange={updateField} />
                </label>

                <label>
                  Designation
                  <input name="designation" value={form.designation} onChange={updateField} />
                </label>

                <label>
                  Phone
                  <input name="phone" value={form.phone} onChange={updateField} />
                </label>

                <label>
                  Basic salary
                  <input
                    name="basicSalary"
                    type="number"
                    min="0"
                    value={form.basicSalary}
                    onChange={updateField}
                  />
                </label>

                <label>
                  Allowances
                  <input
                    name="allowances"
                    type="number"
                    min="0"
                    value={form.allowances}
                    onChange={updateField}
                  />
                </label>

                <label className="emp-full-width">
                  Address
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={updateField}
                    rows={3}
                  />
                </label>
              </div>

              {error && <div className="emp-alert emp-alert-error">{error}</div>}

              <div className="emp-modal-actions">
                <button
                  type="button"
                  className="emp-cancel"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="emp-primary" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Save Changes" : "Create Employee"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}